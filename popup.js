(async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  chrome.tabs.sendMessage(
    tab.id,
    {
      type: "get-options",
    },
    (result) => {
      const declarationTypeHtml = result.declarationTypeOptions
        .map(
          (option) => `
            <option value="${option.value}">${option.html}</option>
            `
        )
        .join(" ");
      document.getElementById("declarationType").innerHTML =
        declarationTypeHtml;

      const languageCombinationHtml = result.languageCombinationOptions
        .map(
          (option) => `
            <option value="${option.value}">${option.html}</option>
            `
        )
        .join(" ");
      document.getElementById("lang").innerHTML += languageCombinationHtml;
    }
  );
})();

document.getElementById("start").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const lang = document.getElementById("lang").value;
  if (!lang) {
    alert("Please select language combination field");
    return;
  }
  const selectedRadioBtn = document.querySelector(
    'input[name="stampingPref"]:checked'
  );
  if (!selectedRadioBtn) {
    alert("Please select the Stamping Preference");
    return;
  }
  const declarationType = document.getElementById("declarationType").value;
  chrome.tabs.sendMessage(
    tab.id,
    {
      type: "start",
      lang,
      stampingPref: selectedRadioBtn.id,
      declarationType,
    },
    (result) => {}
  );
});
