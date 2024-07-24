const BASE_URL = "http://localhost:8000";

// default mode ของหน้านี้คือ mode สร้าง
let mode = "CREATE";
let selectedId = -1;

window.onload = async () => {
  // นำ parameter ทั้งหมดมาใส่ตัวแปร urlParams
  const urlParams = new URLSearchParams(window.location.search);
  // ดึง id ออกมาจาก parameter
  const id = urlParams.get("id");
  if (id) {
    let editHeadFrom = await document.querySelector(".header.form-input");
    editHeadFrom.textContent = "Edit user";
    // ถ้ามี id = เปลี่ยน mode และเก็บตัวแปร id เอาไว้
    mode = "EDIT";
    selectedId = id;

    

    // select ทุก dom ออกมา
    let firstNameDOM = document.querySelector("input[name=firstname]");
    let lastNameDOM = document.querySelector("input[name=lastname]");
    let ageDOM = document.querySelector("input[name=age]");
    let genderDOMs = document.querySelectorAll("input[name=gender]");
    let interestDOMs = document.querySelectorAll("input[name=interest]");
    let descriptionDOM = document.querySelector("textarea[name=description]");
    try {
      const response = await axios.get(`${BASE_URL}/users/${id}`);
      const user = response.data;
       
      console.log(user);
      // เริ่มทำการใส่ข้อมูล
      firstNameDOM.value = user.firstname;
      lastNameDOM.value = user.lastname;
      ageDOM.value = user.age;
      descriptionDOM.value = user.description;

      for (let i = 0; i < genderDOMs.length; i++) {
        if (genderDOMs[i].value == user.gender) {
          genderDOMs[i].checked = true;
        }
      }
      const interests = user.interest.split(",").map((interest) => interest.trim());

      for (let i = 0; i < interestDOMs.length; i++) {
        if (interests.includes(interestDOMs[i].value)) {
          interestDOMs[i].checked = true;
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  }
};
const validateData = (userData) => {
  let errors = [];
  if (!userData.firstname) {
    errors.push("กรุณาใส่ชื่อจริง");
  }
  if (!userData.lastname) {
    errors.push("กรุณาใส่นามสกุล");
  }
  if (!userData.age) {
    errors.push("กรุณาใส่อายุ");
  }
  if (!userData.description) {
    errors.push("กรุณาใส่คำอธิบาย");
  }
  if (!userData.interest) {
    errors.push("กรุณาเลือกความสนใจอย่างน้อย 1 อย่าง");
  }
  return errors;
};

const submitData = async () => {
  let firstNameDOM = document.querySelector("input[name=firstname]");
  let lastNameDOM = document.querySelector("input[name=lastname]");
  let ageDOM = document.querySelector("input[name=age]");

  let genderDOM = document.querySelector("input[name=gender]:checked") || {};
  let interestDOMs =
    document.querySelectorAll("input[name=interest]:checked") || {};

  let descriptionDOM = document.querySelector("textarea[name=description]");
  let responseMessageDOM = document.getElementById("response-message");

  let interest = "";

  for (let i = 0; i < interestDOMs.length; i++) {
    interest += interestDOMs[i].value;
    if (i != interestDOMs.length - 1) {
      interest += ",";
    }
  }

  try {
    let userData = {
      firstname: firstNameDOM.value,
      lastname: lastNameDOM.value,
      age: ageDOM.value,
      gender: genderDOM.value,
      description: descriptionDOM.value,
      interest: interest,
    };
    // เพิ่มการเรียกใช้ validate ขึ้นมา
    const errors = validateData(userData);

    // ถ้าเจอ error อย่างน้อย 1 ตัว
    if (errors.length > 0) {
      throw {
        message: "กรอกข้อมูลไม่ครบ",
        errors: errors,
      };
    }

    const response = await axios.post("http://localhost:8000/users/", userData);
    console.log("response data", response.data);
    responseMessageDOM.innerText = "เพิ่มข้อมูลเรียบร้อย !";
    responseMessageDOM.className = "message success";
  } catch (error) {
    let messageDOM = "มีปัญหาเกิดขึ้น";
    let errors = error.errors || [];
    let errorMessage = error.message;

    if (errors && errors.length > 0) {
      messageDOM = "<div>";
      messageDOM += `<div>${errorMessage}</div>`;
      messageDOM += "<ul>";
      for (let i = 0; i < errors.length; i++) {
        messageDOM += `<li>${errors[i]}</li>`;
      }
      messageDOM += "</ul>";
      messageDOM += "</div>";
    }
    responseMessageDOM.innerHTML = messageDOM;
    responseMessageDOM.className = "message danger";
  }
};
