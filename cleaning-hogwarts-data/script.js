"use strict";

window.addEventListener("DOMContentLoaded", start);

const cleanedData = [];

const link = "https://petlatkea.dk/2020/hogwarts/students.json";

const Student = {
  firstname: "",
  middlename: "",
  lastname: "",
  nickname: "",
  image: "",
  house: "",
};

function start() {
  console.log("ready");

  loadJSON();
}
function loadJSON() {
  fetch(link)
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      prepareObjects(jsonData);
    });
}

function prepareObjects(jsonData) {
  console.log(jsonData);
  jsonData.forEach((jsonObject) => {
    // Create new object with cleaned data - and store that in the cleanedData array
    const student = Object.create(Student);

    // full name with no spaces at the start or end
    const nameTrimmed = jsonObject.fullname.trim();

    // finds first name and puts it in the const firstName, ignore the rest
    const [firstName, null3, null2] = nameTrimmed.split(" ");

    // finds last name
    let lastName = "";

    if (nameTrimmed.includes(" ")) {
      lastName = nameTrimmed.substring(nameTrimmed.lastIndexOf(" ") + 1);
    } else {
      student.lastname = undefined;
    }

    // find middle name
    let middleName = "";

    if (nameTrimmed.includes('"')) {
      student.middlename = undefined;
    } else if (nameTrimmed.includes(" ")) {
      middleName = nameTrimmed.substring(
        nameTrimmed.indexOf(" ") + 1,
        nameTrimmed.lastIndexOf(" ") + 1
      );
    } else {
      student.middlename = undefined;
    }

    //  FINAL
    student.firstname =
      firstName.substring(0, 1).toUpperCase() +
      firstName.substring(1).toLowerCase();

    // checks if last name includes a hyphen before changing to uppercase and lowercase
    if (lastName.includes("-")) {
      student.lastname = lastName;
    } else {
      student.lastname =
        lastName.substring(0, 1).toUpperCase() +
        lastName.substring(1).toLowerCase();
    }

    student.middlename =
      middleName.trimEnd().substring(0, 1).toUpperCase() +
      middleName.trimEnd().substring(1).toLowerCase();

    student.nickname = nameTrimmed.substring(
      nameTrimmed.indexOf('"') + 1,
      nameTrimmed.lastIndexOf('"')
    );

    student.house =
      jsonObject.house.trim().substring(0, 1).toUpperCase() +
      jsonObject.house.trim().substring(1).toLowerCase();

    // navne til filnavne
    const fileLastName = lastName.toLowerCase();
    const firstCharName = firstName[0].toLowerCase();

    if (fileLastName.includes("-")) {
      student.image =
        fileLastName.substring(fileLastName.indexOf("-") + 1) +
        "_" +
        firstCharName +
        ".png";
    } else if (nameTrimmed.includes(" ")) {
      student.image = `${fileLastName}_${firstCharName}.png`;
    } else {
      // til at fjerne dumme leanne
      student.image = undefined;
    }

    console.log(student);
  });
}
