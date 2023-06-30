var rrrrqest;
var is_lastPage = false;
chrome.storage.local.get(["value"], (result) => {
  if (window.location.origin === "https://certify.stibc.org") {
    if (result.value.totalIndex == result.value.index) {
      console.log("last index");
      is_lastPage = true;
    }
    console.log(result.value);
    if (result.value.is_dataPending) {
      let data = [];
      let indexData = result.value.data[result.value.index - 1];

      dataURLtoBlob = (dataURL) => {
        const arr = dataURL.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
      };

      blobToFile = (blob, fileName) => {
        const file = new File([blob], fileName, { type: blob.type });
        Object.defineProperty(file, "webkitRelativePath", {
          value: `files/${fileName}`,
          writable: true,
        });
        return file;
      };

      orgbblob = dataURLtoBlob(indexData.orgBlob);
      transblobb = dataURLtoBlob(indexData.transBlob);
      console.log(orgbblob);
      console.log(transblobb);
      orgFile = blobToFile(
        orgbblob,
        indexData.OrginalFileName + indexData.fileExt
      );
      transFile = blobToFile(
        transblobb,
        indexData.translatedFileName + indexData.fileExt
      );

      console.log(orgFile);
      console.log(transFile);
      let NamewE = indexData.filename;
      data.push({
        originFile: orgFile,
        translatedFile: transFile,
        filename: NamewE,
      });
      console.log(data);
      const request = result.value.request;
      rrrrqest = result.value.request;
      if (result.value.index <= result.value.totalIndex) {
        console.log(data);
        nextindex = result.value.index + 1;
        console.log("index updation start");
        chrome.storage.local.set(
          {
            value: {
              is_dataPending: true,
              data: result.value.data,
              index: nextindex,
              totalIndex: result.value.data.length,
              request: request,
            },
          },
          () => {
            console.log("index is increamented" + nextindex);
          }
        );
        setTimeout(() => {
          loadData(data, request);
        }, 1000);
      } else {
        console.log(data);
        // loadData(data,request)
        chrome.storage.local.set(
          { value: { is_dataPending: false, data: [] } },
          () => {
            console.log("last index is loaded and data is reseted");
          }
        );
      }
    }
  }
});

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   if (message.message === "TabChanged") {
//     setInterval(() => {
//       console.log("tab_changed "+ (0+1))
//       startChecking(rrrrqest);
//     }, 1000);

//   }
// });

if (window.location.origin === "https://certify.stibc.org") {
  // const anchor = document.createElement("a");
  // anchor.href = URL.createObjectURL(new Blob([]));
  // anchor.download = "1.txt";
  // document.body.appendChild(anchor);
  // anchor.click();
  // anchor.click();
  // document.body.removeChild(anchor);

  var script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  (document.head || document.documentElement).appendChild(script);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  rrrrqest = request;
  if (
    window.location.origin === "https://certify.stibc.org" &&
    window.location.pathname === "/" &&
    request.type === "get-options"
  ) {
    const declarationTypeSelectEl = document.getElementById("declarationType");
    const declarationTypeOptionEls =
      declarationTypeSelectEl.getElementsByTagName("option");
    const declarationTypeOptions = [];
    for (let el of declarationTypeOptionEls) {
      if (!el.getAttribute("id")) {
        declarationTypeOptions.push({
          value: el.getAttribute("value"),
          html: el.innerHTML,
        });
      }
    }

    const languageCombinationSelectEl =
      document.getElementsByName("langCombo")[0];
    const languageCombinationOptionEls =
      languageCombinationSelectEl.getElementsByTagName("option");
    const languageCombinationOptions = [];
    for (let el of languageCombinationOptionEls) {
      if (!el.disabled) {
        languageCombinationOptions.push({
          value: el.getAttribute("value"),
          html: el.innerHTML,
        });
      }
    }

    sendResponse({ declarationTypeOptions, languageCombinationOptions });
  } else if (request.type === "start") {
    const filePicker = document.createElement("input");
    filePicker.type = "file";
    filePicker.setAttribute("directory", true);
    filePicker.setAttribute("multiple", true);
    filePicker.setAttribute(
      "accept",
      ".pdf,.doc,.docx,.docm,.odt,.jpg,.jpeg,.png"
    );
    filePicker.click();
    filePicker.addEventListener("change", async (event) => {
      let files = [];
      for (let file of event.target.files) {
        // console.log(file.webkitRelativePath)
        files.push(file);
        //         const fileInput = document.getElementById('fileInput');
        // const file = fileInput.files[0];
        // const reader = new FileReader();

        // reader.onload = function(event) {
        //   const fileData = event.target.result;
        //   console.log('File saved locally.');
        //   console.log(fileData);
        // };

        // reader.readAsDataURL(file);
      }
      let pairs = [];
      let pairsBlob = [];
      while (files.length) {
        let originFile;
        files = files.filter((file) => {
          if (originFile) return true;
          let wordsOfName = file.name.split(".");
          if (wordsOfName.length > 1) {
            let fileType = wordsOfName[wordsOfName.length - 1];
            if (
              fileType === "pdf" ||
              fileType === "doc" ||
              fileType === "docx" ||
              fileType === "docm" ||
              fileType === "odt" ||
              fileType === "jpg" ||
              fileType === "jpeg" ||
              fileType === "png"
            ) {
              if (file.name.includes("O")) {
                const no = file.name.split("O")[0];
                if (Number(no) > 0 || no === "0") {
                  originFile = file;
                  return false;
                }
              }
            }
          }
          return true;
        });
        if (originFile) {
          const translatedFileName = deleteFileType(originFile.name).replace(
            "O",
            "T"
          );
          const OrginalFileName = deleteFileType(originFile.name);
          let translatedFile;
          let filename;
          files = files.filter((file) => {
            if (translatedFile) return true;
            if (deleteFileType(file.name) === translatedFileName) {
              translatedFile = file;
              filename = translatedFileName.slice(
                translatedFileName.indexOf("T") + 1
              );
              return false;
            }
            return true;
          });
          if (translatedFile) {
            pairs.push({ originFile, translatedFile, filename });

            blobToDataURL = (blob) => {
              return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onloadend = () => {
                  const dataURL = reader.result;
                  resolve(dataURL);
                };

                reader.onerror = reject;

                reader.readAsDataURL(blob);
              });
            };

            const orgBlob = await blobToDataURL(originFile);
            const transBlob = await blobToDataURL(translatedFile);
            let x = originFile.name.split(".");
            let fileExt = "." + x[x.length - 1];
            console.log(fileExt);
            pairsBlob.push({
              orgBlob,
              transBlob,
              filename,
              fileExt,
              OrginalFileName,
              translatedFileName,
            });
            console.log(translatedFileName);
            console.log(OrginalFileName);
          }
        } else {
          break;
        }
      }
      console.log(pairs);
      console.log(pairsBlob);

      storePairs(pairsBlob, request);
      // for(let i = 0 ; i<(pairsBlob.length-1) ; i++){
      //   setTimeout(() => {

      //   }, 2000);
      // }
      let interval = 0;
      console.log(interval);
      let opentabInterval = setInterval(() => {
        console.log(interval);
        interval++;
        if (interval >= pairsBlob.length) {
          clearInterval(opentabInterval);
        } else {
          chrome.runtime.sendMessage(pairsBlob.length);
        }
      }, 2000);

      let arr = [];
      arr.push(pairs[0]);
      pairs = arr;
      const originFileInput = document.getElementById("originalDocument");
      const translatedFileInput = document.getElementById("translatedDocument");
      const descr = document.getElementsByName("descr")[0];
      const buttons = document.querySelectorAll("form#pkgForm button");
      const langCombo = document.getElementsByName("langCombo")[0];
      const stampingPref = document.getElementById(request.stampingPref);
      const declarationType = document.getElementById("declarationType");

      for (let pair of pairs) {
        langCombo.value = request.lang;
        stampingPref.checked = true;
        declarationType.value = request.declarationType;

        let dataTransfer = new DataTransfer();
        dataTransfer.items.add(pair.originFile);
        originFileInput.files = dataTransfer.files;

        dataTransfer = new DataTransfer();
        dataTransfer.items.add(pair.translatedFile);
        translatedFileInput.files = dataTransfer.files;

        descr.textContent = pair.filename;
        buttons[buttons.length - 1].click();

        startChecking(rrrrqest, "no");
      }
    });
  }
});

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

const deleteFileType = (fileName) => {
  return fileName.slice(0, fileName.lastIndexOf("."));
};

function storePairs(pairs, request) {
  chrome.storage.local.set(
    {
      value: {
        is_dataPending: true,
        data: pairs,
        index: 2,
        totalIndex: pairs.length,
        request: request,
      },
    },
    () => {
      console.log("stored" + pairs);
    }
  );
}

async function loadData(pairs, request) {
  const originFileInput = document.getElementById("originalDocument");
  const translatedFileInput = document.getElementById("translatedDocument");
  const descr = document.getElementsByName("descr")[0];
  const buttons = document.querySelectorAll("form#pkgForm button");
  const langCombo = document.getElementsByName("langCombo")[0];
  const stampingPref = document.getElementById(request.stampingPref);
  const declarationType = document.getElementById("declarationType");

  for (let pair of pairs) {
    langCombo.value = request.lang;
    stampingPref.checked = true;
    declarationType.value = request.declarationType;

    let dataTransfer = new DataTransfer();
    dataTransfer.items.add(pair.originFile);
    originFileInput.files = dataTransfer.files;

    dataTransfer = new DataTransfer();
    dataTransfer.items.add(pair.translatedFile);
    translatedFileInput.files = dataTransfer.files;

    descr.textContent = pair.filename;
    buttons[buttons.length - 1].click();

    startChecking(rrrrqest);
  }
}

async function startChecking(request, extra = null) {
  const confirmModal = document.getElementById("modalDlg");
  const progress = document.querySelector('progress[name="progressBar"]');
  const confirmButton = document.querySelector('button[name="continueButton"]');
  while (true) {
    if (getComputedStyle(confirmModal).display !== "none") {
      break;
    }
    await sleep(100);
  }

  await sleep(100);
  const pdfFrame = document.querySelector('iframe[name="pdfFrame"]');

  let is_confirmed = false;
  confirmButton.addEventListener("click", async () => {
    is_confirmed = true;
    console.log("confirmed");

    setTimeout(() => {
      let intervalNN = setInterval(() => {
        if (
          getComputedStyle(
            document.querySelector('iframe[name="stampedPdfFrame"]')
          ).display === "none" &&
          getComputedStyle(document.querySelector('div[name="postStamping"]'))
            .display === "none"
        ) {
          console.log("interval is closed");
          if (extra == null) {
            console.log(is_lastPage);
            chrome.runtime.sendMessage({
              closeWindow: true,
              is_last: is_lastPage,
            });
          }
          clearInterval(intervalNN);
        } else {
          console.log("interval is running");
          confirmButton.click();
        }
      }, 1000);
    }, 1000);
  });
  if (request.stampingPref === "stampPages") {
    while (true) {
      if (
        getComputedStyle(pdfFrame).display !== "none" &&
        pdfFrame.contentWindow.document.readyState === "complete"
      ) {
        // await sleep(1500);
        // confirmButton.click();
        // break;
        if (is_confirmed == true) {
          break;
        }
      }
      await sleep(100);
    }
  }

  // while (true) {
  //   await sleep(100);
  // }

  await sleep(100);

  while (true) {
    if (getComputedStyle(pdfFrame).display === "none") {
      confirmButton.click();
      break;
    }
    await sleep(100);
  }

  await sleep(100);

  while (true) {
    if (progress.getAttribute("value") === "100") {
      if (extra == null) {
        console.log(is_lastPage);
        chrome.runtime.sendMessage({ closeWindow: true, is_last: is_lastPage });
      }
      confirmButton.click();
      break;
    }
    await sleep(100);
  }
  while (true) {
    if (getComputedStyle(confirmModal).display === "none") {
      break;
    }
    await sleep(100);
  }
}
