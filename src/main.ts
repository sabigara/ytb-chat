import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/index.scss";
import { nanoid } from "nanoid";

type Message = {
  id: string;
  content: string;
  timestamp: number;
  sender: string;
};

function bootstrapChatRoom(close: () => void) {
  const ws = new WebSocket("ws://localhost:5273");

  const msgListElm = document.querySelector<HTMLOListElement>(".msg-list")!;
  const formElm = document.getElementById("msg-form") as HTMLFormElement;
  const usernameInputElm = document.getElementById(
    "username"
  ) as HTMLInputElement;
  const msgInputElm = document.getElementById(
    "msg-content"
  ) as HTMLInputElement;
  const closeBtn = document.getElementById("close-btn") as HTMLButtonElement;

  function scrollToEnd() {
    msgListElm.scrollTo(0, msgListElm.scrollHeight);
  }

  function appendMsgNode(msg: Message) {
    const username = usernameInputElm.value;
    const isMine = msg.sender === username;
    const prevSenderName = Array.from(
      msgListElm.querySelectorAll(".msg__sender-name")
    ).at(-1)?.textContent;

    const li = document.createElement("li");
    const msgContent = document.createElement("div");

    li.classList.add("msg");
    msgContent.classList.add("msg__content");

    if (isMine) {
      li.classList.add("mine");
      msgContent.classList.add("mine");
    }

    msgContent.textContent = msg.content;

    if (!prevSenderName || prevSenderName !== msg.sender) {
      const senderContainer = document.createElement("div");
      const senderName = document.createElement("div");
      const senderAvatar = document.createElement("img");

      senderContainer.classList.add("msg__sender");
      senderName.classList.add("msg__sender-name");
      senderName.textContent = msg.sender;
      senderAvatar.classList.add("msg__sender-avatar");
      senderAvatar.src = `https://avatars.dicebear.com/api/pixel-art/${msg.sender}.svg`;

      if (msg.sender !== username) senderContainer.appendChild(senderAvatar);
      senderContainer.appendChild(senderName);
      li.appendChild(senderContainer);
    }

    li.appendChild(msgContent);
    msgListElm.appendChild(li);
  }

  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    appendMsgNode(msg);
    scrollToEnd();
  });

  formElm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInputElm.value;
    const msgContent = msgInputElm.value;
    const msg: Message = {
      id: nanoid(),
      content: msgContent,
      timestamp: Date.now(),
      sender: username,
    };
    ws.send(JSON.stringify(msg));
    appendMsgNode(msg);
    scrollToEnd();
    msgInputElm.value = "";
  });

  closeBtn.addEventListener("click", close);
}

function bootstrapPopover() {
  const container = document.getElementById("popover")!;
  const trigger = document.getElementById("popover-trigger")!;
  const panel = document.getElementById("popover-panel")!;
  const STATE_OPEN = "data-open" as const;

  function open() {
    container.setAttribute(STATE_OPEN, "true");
    panel.setAttribute(STATE_OPEN, "true");
  }

  function close() {
    container.removeAttribute(STATE_OPEN);
    panel.removeAttribute(STATE_OPEN);
  }

  trigger.addEventListener("click", () => {
    const isOpen = !!container.getAttribute(STATE_OPEN);
    if (isOpen) {
      close();
    } else {
      open();
    }
  });
  return { open, close };
}

const { close } = bootstrapPopover();
bootstrapChatRoom(close);
