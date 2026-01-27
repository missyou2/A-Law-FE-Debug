테스트 서버 실행
npx json-server --watch db.json --port 4000

***db.json***
{
  "contracts": [
    { "id": 1, "title": "2024년 복정동 전세...", "date": "2024. 11. 19", "isImportant": true },
    { "id": 2, "title": "논현동 매매계약서", "date": "2024. 12. 10", "isImportant": false },
    { "id": 3, "title": "매매계약서 사본", "date": "2024. 11. 17", "isImportant": false },
    { "id": 4, "title": "2023년 월세계약서", "date": "2023. 05. 22", "isImportant": false }
  ]
}