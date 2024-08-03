const BASE_URL = "http://localhost:8000";

window.onload = async () => {
  await loadData();
  attachDeleteEventListeners()
};

const attachDeleteEventListeners = () => {
  let deleteDOMs = document.getElementsByClassName("delete");
  const authToken = localStorage.getItem("token");

  for (let i = 0; i < deleteDOMs.length; i++) {
    deleteDOMs[i].addEventListener("click", async (event) => {
      // ดึงค่า id ที่ฝังไว้กับ data-id เพื่อใช้สำหรับ reference กลับไปยังฝั่ง Backend
      let id = event.target.dataset.id;

      try {
        await axios.delete(`${BASE_URL}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        await loadData(); // เรียก loadData ใหม่หลังจากลบ
        attachDeleteEventListeners(); // ผูก event listeners ใหม่ให้กับปุ่ม delete
      } catch (error) {
        console.log("error", error);
      }
    });
  }
};

const loadData = async () => {
  //get user ทั้งหมดออกมา
  const authToken = localStorage.getItem("token");
  if (!authToken) {
    window.location.replace("./login.html");
    return;
  }

  try {
    //get users
    const response = await axios.get("http://localhost:8000/users", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const users = response.data;

    // ประกอบ HTML จาก user data โดยใช้ <li> และ สร้างปุ่มสำหรับ Edit และ Delete
    // ประกอบ HTML จาก user data โดยใช้ <li> และสร้างปุ่มสำหรับ Edit และ Delete
    let userHTMLData = `
     <div class="overflow-x-auto">
       <table class="min-w-full divide-y divide-gray-200">
         <thead class="bg-gray-50">
           <tr>
             <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
             <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
             <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
           </tr>
         </thead>
         <tbody class="bg-white divide-y divide-gray-200">
   `;

    for (let i = 0; i < users.length; i++) {
      userHTMLData += `
       <tr>
         <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${users[i].id}</td>
         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${users[i].firstname} ${users[i].lastname}</td>
         <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
           <a href='index.html?id=${users[i].id}' class="text-indigo-600 hover:text-indigo-900">Edit</a>
           <button class="text-red-600 hover:text-red-900 ml-4 delete" data-id='${users[i].id}'>Delete</button>
         </td>
       </tr>
     `;
    }

    userHTMLData += `
         </tbody>
       </table>
     </div>
   `;
    //นำ html ประกอบใส่กลับเข้าไปใน DOM html
    let usersDOM = document.getElementById("users");
    usersDOM.innerHTML = userHTMLData;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};

const logout = () => {
  localStorage.removeItem('token'); // ลบ token ออกจาก localStorage
  window.location.replace('./login.html'); // redirect ผู้ใช้ไปยังหน้า login
}

document.getElementById('logoutButton').addEventListener('click', logout);


