"""전국초중등학교위치표준데이터(.xls)에서 제주 학교를 뽑아 src/schools.json으로 저장합니다.

사용법: python scripts/import-schools.py <전국초중등학교위치표준데이터.xls>
필요 패키지: xlrd (구형 .xls 파일은 cp949로 저장되어 있습니다)
"""
import json
import sys
from pathlib import Path

import xlrd

LEVELS = {"초등학교": "초등", "중학교": "중등", "고등학교": "고등"}
OUTPUT = Path(__file__).resolve().parent.parent / "src" / "schools.json"


def main(source):
    sheet = xlrd.open_workbook(source, encoding_override="cp949").sheet_by_index(0)
    rows = [[str(cell.value).strip() for cell in sheet.row(index)] for index in range(sheet.nrows)]
    header = next(row for row in rows if "학교명" in row)
    col = {name: header.index(name) for name in ["학교명", "학교급구분", "설립일자", "설립형태", "본교분교구분", "운영상태", "소재지지번주소", "소재지도로명주소"]}
    schools = {}
    for row in rows:
        address = row[col["소재지지번주소"]]
        name = row[col["학교명"]].replace("JeJu", "Jeju")
        if not address.startswith("제주특별자치도") or row[col["운영상태"]] != "운영" or "분교장" in name:
            continue
        international = not name.endswith("학교") or "국제학교" in name
        if row[col["본교분교구분"]] == "분교" and not international:
            continue
        parts = address.split()
        schools.setdefault(name, {
            "name": name,
            "level": "국제" if international else LEVELS[row[col["학교급구분"]]],
            "city": parts[1],
            "town": parts[2],
            "founded": row[col["설립일자"]][:4],
            "type": row[col["설립형태"]],
            "address": row[col["소재지도로명주소"]].replace("제주특별자치도 ", "")
        })
    result = sorted(schools.values(), key=lambda school: (school["city"], school["town"], school["level"], school["name"]))
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Saved {len(result)} schools to {OUTPUT}")


if __name__ == "__main__":
    main(sys.argv[1])
