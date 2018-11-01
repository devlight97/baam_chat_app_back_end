var colorForTab = [
    "alert-primary",
    "alert-secondary",
    "alert-warning",
    "alert-danger",
    "alert-info"
];
var colorIndex = 0;
var USER = "";
var TABS = [];

// kết nối socket.io
var myName = document.querySelector(".user-name").getAttribute("data-name");
const socket = io("http://localhost:8080");
socket.emit("add-user-connect", myName);
socket.on("goto-login", function () {
    window.open("http://localhost:8080","_self");
    alert("Tên người dùng đã tồn tại !!");
});
socket.on("get-all-user", function (users) {
    for ( user of users ) {
        if ( user.name !== myName && getMessageByName(user.name) == undefined ) addTab(user.name);
    }
    initEventSelectTab();
});

socket.on("delete-user", function (user) {
    let indexDelete = null;
    for ( let i = 0; i < TABS.length; i++ ) {
        if ( TABS[i].user === user.name ) {
            indexDelete = i;
            break;
        }
    }

    if ( user.name === USER ) USER = "";

    if (indexDelete !== null) {
        TABS.splice(indexDelete, 1);
        reloadTabUser();
    }
});

socket.on("send-message-to-client", function (other, msg) {
    for ( tab of TABS ) {
        if ( tab.user === other ) {
            tab.tabChat.push({
                object: "other",
                message: msg
            });
        }
    }
    reloadTabChat(USER);
});


document.addEventListener("DOMContentLoaded", function () {
    console.log("Hello Node");
    
    // test dữ liệu
    addMessage("self", "Chọn bạn chat bên trái nhé !!");

    // chuyển đến cuối tab
    scrollToBottom();

    // sự kiện gửi tin nhắn
    document.getElementById("btn-send").addEventListener("click", function () {
        sendMessage();
    });

    window.addEventListener("keyup", function (evt) {
        if ( evt.keyCode === 13 ) {
            sendMessage();
        }
    });
});

// gửi tin nhắn
function sendMessage() {
    if (USER === "") {
        addMessage("other", "Người dùng không tồn tại !!");
        document.getElementById("text-content").value = "";
        // chuyển đến cuối tab
        scrollToBottom();
        return;
    }

    var message = document.getElementById("text-content").value;
    if ( message !== "" ) {
        console.log(message);
        addMessage("self", message);
        getMessageByName(USER).push({
            object: "self",
            message
        });
        document.getElementById("text-content").value = "";
    }

    socket.emit("send-message-to-server", myName, USER, message);

    // chuyển đến cuối tab
    var tabChat = document.querySelector(".tab-chat__message");
    tabChat.scrollTop = tabChat.scrollHeight;
}

function initEventSelectTab() {
    // gắn sự kiện chọn tab
    var tabsUser = document.getElementsByClassName("tab-user");
    
    for (el of tabsUser) {
        el.addEventListener("click", function () {
            // chuyển tab user
            for (tab of tabsUser) {
                tab.classList.remove("tab-selected");
            }
            this.classList.add("tab-selected");

            // thay đổi title
            var title = document.querySelector(".tab-chat__title span");
            title.innerText = this.getAttribute("data-name");

            // chuyển tab chat
            reloadTabChat(this.getAttribute("data-name"));
            USER = this.getAttribute("data-name");

            // chuyển đến cuổi tab
            scrollToBottom();
        });
    }
}


function getMessageComponent(object, content) {
    var class_css = "";
    if ( object === "self" ) {
        class_css = "msg-self";
    }
    else if ( object === "other" ) {
        class_css = "msg-other";
    }
    return `<li class="${class_css}"><p>${content}</p></li>`;
}

function getTabComponent(name) {
    var class_css = colorForTab[colorIndex];
    if ( colorIndex === colorForTab.length-1 ) {
        colorIndex = 0;
    } else {
        colorIndex++;
    }
    return `<div data-name="${name}" class="alert ${class_css} tab-user">${name}</div>`;
}

function addTab(name) {
    TABS.push({
        user: name,
        tabChat: []
    });
    reloadTabUser();
}

function deleteTab(name) {
    var indexDelete = null;

    for (let i = 0; i < TABS.length; i++) {
        if ( TABS[i].user === name ) {
            indexDelete = i;
            break;
        }
    }
    
    if (indexDelete !== null) {
        TABS.splice(indexDelete, 1);
    }
    reloadTabUser();
}

function addMessage(object, msg) {
    var msgComponent = getMessageComponent(object, msg);
    document.querySelector(".msgs").innerHTML += msgComponent;
}

function getMessageByName(name) {
    for ( tab of TABS ) {
        if ( tab.user === name ) {
            return tab.tabChat;
        }
    };
}

function reloadTabUser() {
    var tabsUser = document.querySelector(".tabs");
    tabsUser.innerHTML = "";
    for ( tab of TABS ) {
        tabsUser.innerHTML += getTabComponent(tab.user);
    }
}

function scrollToBottom() {
    // chuyển đến cuối tab
    var tabChat = document.querySelector(".tab-chat__message");
    tabChat.scrollTop = tabChat.scrollHeight;
}

function reloadTabChat(name) {
    if (name === "") return;
    var msgs = document.querySelector(".msgs");
    msgs.innerHTML = "";
    var tabChat = getMessageByName(name);
    tabChat.forEach( (msg) => {
        addMessage(msg.object, msg.message);
    } );
    scrollToBottom();
}