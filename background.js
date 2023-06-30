chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.closeWindow) {
        if(message.is_last==true){
            chrome.downloads.showDefaultFolder();
        }
        chrome.tabs.remove(sender.tab.id);
      }
 else{
    chrome.windows.create({ url: "https://certify.stibc.org/" }, () => {
        console.log("page created")
      
     });
 }
    console.log(message)
    sendResponse({tabId , changeInfo})
  });
  
  
  

//   chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     // Handle the received message
//     console.log('Received message:', message);
    
//     // Send a response back (if needed)
//     sendResponse('Message received!');
//   });
  