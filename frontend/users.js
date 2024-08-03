const BASE_URL = "http://localhost:8000";

window.onload = async () => {
  await loadData();

 

  // ทำการดึง button class=delete ที่ติดกับทุก DOM ที่สร้างใหม่มา
  let deleteDOMs = document.getElementsByClassName("delete");

  // หลังจากนั้น ทำการวนลูปไปยังทุก DOM และเพิ่ม click event
  for (let i = 0; i < deleteDOMs.length; i++) {
    deleteDOMs[i].addEventListener("click", async (event) => {
      // ดึงค่า id ที่ฝังไว้กับ data-id เพื่อใช้สำหรับ reference กลับไปยังฝั่ง Backend
      let id = event.target.dataset.id;

      try {
        await axios.delete(`${BASE_URL}/users/${id}`);
        loadData();
      } catch (error) {
        console.log("error", error);
      }
    });
  }
};

const loadData = async () => {
  //get user ทั้งหมดออกมา
  const response = await axios.get(`${BASE_URL}/users`, { withCredentials: true });
  console.log(response);
  const users = response.data;

  // ประกอบ HTML จาก user data โดยใช้ <li> และ สร้างปุ่มสำหรับ Edit และ Delete
  let userHTMLData = "<ul>";
  for (let i = 0; i < users.length; i++) {
    userHTMLData += `
    ID: ${users[i].id} ${users[i].firstname} ${users[i].lastname}
        <a href='index.html?id=${users[i].id}'><button data-id='${users[i].id}'>Edit</button></a>
        <button class='delete' data-id='${users[i].id}'>Delete</button>
        <br>`;
  }

  userHTMLData += "</ul>";
  //นำ html ประกอบใส่กลับเข้าไปใน DOM html
  let usersDOM = document.getElementById("users");
  usersDOM.innerHTML = userHTMLData;
};
