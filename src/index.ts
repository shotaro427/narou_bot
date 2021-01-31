import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;

const BASE_URL = "https://api.syosetu.com/novelapi/api/?out=json&ncode=";
const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

const notifyUpdate = () => {
  const accessToken = PropertiesService.getScriptProperties().getProperty(
    "ACCESS_TOKEN"
  );
  const spredsheetId = PropertiesService.getScriptProperties().getProperty(
    "SPREDSHEET_ID"
  );
  const roomId = PropertiesService.getScriptProperties().getProperty(
    "SPREDSHEET_ID"
  );

  // 既存のspreadシートを取得する
  const spreadSheet = SpreadsheetApp.openById(spredsheetId || "");

  const sheet = spreadSheet.getSheetByName("シート1");
  const sheet2 = spreadSheet.getSheetByName("シート2");
  if (!sheet || !sheet2) {
    // TODO エラーを通知
    return;
  }

  const sources = sheet.getDataRange().getValues();
  sources.shift();
  sources.forEach((source, index) => {
    const data = JSON.parse(
      UrlFetchApp.fetch(BASE_URL + source[1]).getContentText()
    );

    if (
      data[1]["general_lastup"] !== source[2] &&
      parseInt(data[1]["general_all_no"]) > parseInt(source[3])
    ) {
      // update spredsheet
      sheet.getRange(index + 2, 3).setValue(data[1]["general_lastup"]);
      sheet.getRange(index + 2, 4).setValue(data[1]["general_all_no"]);

      UrlFetchApp.fetch(LINE_PUSH_URL, {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: "Bearer " + accessToken,
        },
        method: "post",
        payload: JSON.stringify({
          to: roomId,
          messages: [
            {
              type: "text",
              text: `${data[1]["title"]}が更新されました！！\n https://ncode.syosetu.com/${data[1]["ncode"]}/${data[1]["general_all_no"]}`,
            },
          ],
        }),
      });
    }
  });
};

function doPost(e) {
  //   const spreadSheet = SpreadsheetApp.openById(
  //     "1kesCjBsz1kLtg7qKuXsrMe2LBgNBwHSrCk21bFAiuvQ"
  //   );
  //   const sheet = spreadSheet.getSheetByName("シート2");
  //   // グループID
  //   const groupId = JSON.parse(e.postData.contents).events[0].source.roomId;

  //   sheet?.getRange(1, 1).setValue(groupId);
  return ContentService.createTextOutput(
    JSON.stringify({ content: "post ok" })
  ).setMimeType(ContentService.MimeType.JSON);
}
