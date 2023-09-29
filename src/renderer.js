const closeButton = document.getElementById("closeButton");

closeButton.addEventListener("click", () => {
  const { myAPI } = window;
  myAPI.closeWindow();
});
