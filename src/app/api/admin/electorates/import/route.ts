import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db, withDatabaseRetry } from "@/lib/db";
import { hashSurname, normalizeMatric } from "@/lib/security";

function cells(line: string) {
  const result: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') {
      value += '"';
      index++;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      result.push(value.trim());
      value = "";
    } else value += character;
  }
  result.push(value.trim());
  return result;
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".csv")) return NextResponse.json({ message: "Choose a CSV file." }, { status: 400 });
  if (file.size > 5_000_000) return NextResponse.json({ message: "CSV must be 5MB or smaller." }, { status: 413 });

  const lines = (await file.text()).replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return NextResponse.json({ message: "CSV has no voter rows." }, { status: 400 });
  const headers = cells(lines[0]).map((value) => value.toLowerCase().replace(/[^a-z]/g, ""));
  const index = (...names: string[]) => headers.findIndex((header) => names.includes(header));
  const indexes = {
    matric: index("matricno", "matriculationnumber", "matric"),
    fullName: index("fullname", "studentname", "name"),
    surname: index("surname", "lastname"),
    level: index("levelpart", "partlevel", "level", "part", "yearofstudy", "academiclevel"),
  };
  if (Object.values(indexes).some((column) => column < 0)) {
    return NextResponse.json({ message: "CSV requires Matric No., Full Name, Surname, and Level / Part columns." }, { status: 400 });
  }

  let imported = 0;
  const errors: string[] = [];
  try {
    for (let row = 1; row < lines.length; row++) {
      const data = cells(lines[row]);
      const matriculationNumber = normalizeMatric(data[indexes.matric] ?? "");
      const displayName = data[indexes.fullName]?.trim() ?? "";
      const surname = data[indexes.surname]?.trim() ?? "";
      const level = data[indexes.level]?.trim() ?? "";
      if (!matriculationNumber || !displayName || !surname || !level) {
        errors.push(`Row ${row + 1}: missing matric number, full name, surname, or level/part`);
        continue;
      }
      await withDatabaseRetry(() => db.voter.upsert({
        where: { matriculationNumber },
        update: { surnameNormalizedHash: hashSurname(surname), displayName, level, eligible: true },
        create: { matriculationNumber, surnameNormalizedHash: hashSurname(surname), displayName, level },
      }));
      imported++;
    }
  } catch {
    return NextResponse.json({ message: "The electorate database is temporarily unavailable. Please try the upload again." }, { status: 503 });
  }
  return NextResponse.json({ imported, errors: errors.slice(0, 20) });
}
