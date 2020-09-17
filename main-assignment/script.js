"use strict";

let currentFilter = "*";
let currentSorting = "firstname";
let expelledStudents = [];
const cleanedData = [];

window.addEventListener("DOMContentLoaded", start);

// student object which is used for each student and stored in the cleanedData array
const Student = {
  firstname: "",
  middlename: "",
  lastname: "",
  nickname: "",
  image: "",
  house: "",
  prefect: false,
  squad: false,
  expelled: false,
};

function start() {
  console.log("ready");
  loadJSON();
}

// loads data
function loadJSON() {
  const link = "https://petlatkea.dk/2020/hogwarts/students.json";
  const link2 = "https://petlatkea.dk/2020/hogwarts/families.json";
  fetch(link)
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      prepareObjects(jsonData);
    });

  //   fetch(link2)
  //     .then((response) => response.json())
  //     .then((familiesJson) => {
  //       // when loaded, prepare objects
  //       prepareObjects(familiesJson);
  //     });
}

// cleans data and stores in new array
function prepareObjects(jsonData) {
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
    const fileFirstName = firstName.toLowerCase();

    if (fileLastName.includes("-")) {
      student.image =
        fileLastName.substring(fileLastName.indexOf("-") + 1) +
        "_" +
        firstCharName +
        ".png";
    } else if (nameTrimmed.includes("Patil")) {
      student.image = `${fileLastName}_${fileFirstName}.png`;
    } else if (nameTrimmed.includes(" ")) {
      student.image = `${fileLastName}_${firstCharName}.png`;
    } else {
      // til at fjerne dumme leanne
      student.image = undefined;
    }

    student.prefect = false;
    student.squad = false;
    student.expelled = false;

    //add clean data to new array
    cleanedData.push(student);
  });
  buildList();
  delegator();
}

// delegating function
function delegator() {
  console.log("Delegator");
  //   displayListOfStudents(cleanedData);
  addEventListenerToButtons();
}

function addEventListenerToButtons() {
  document.querySelector("#filtering").addEventListener("change", selectFilter);
  document.querySelector("#sorting").addEventListener("change", selectSorting);
}

// display list of students from our cleaned data
function displayListOfStudents(students) {
  console.log("students displayed");
  const template = document.querySelector("template");
  let container = document.querySelector(".data-container");

  container.innerHTML = "";

  students.forEach((student) => {
    let klon = template.cloneNode(true).content;
    klon.querySelector(
      ".name"
    ).textContent = `${student.firstname} ${student.lastname}`;
    klon.querySelector(".house").textContent = student.house;
    klon
      .querySelector("article")
      .addEventListener("click", () => visInfo(student));
    container.appendChild(klon);
  });
}

function visInfo(student) {
  console.log(student, "vis info");
  const detalje = document.querySelector("#detalje");
  const lukKnap = document.querySelector(".luk-knap");

  detalje.classList.remove("hide");
  lukKnap.addEventListener("click", () => detalje.classList.add("hide"));

  // displays info
  document.querySelector(
    "#detalje .name"
  ).textContent = `${student.firstname} ${student.lastname}`;
  document.querySelector("#detalje .house").textContent =
    student.house + " House";
  document.querySelector("#detalje .image").src = "images/" + student.image;

  // checks if student is prefect or not and displays correct info
  if (student.prefect === true) {
    document.querySelector("#detalje .prefect").textContent = "Is prefect: Yes";
  } else {
    document.querySelector("#detalje .prefect").textContent = "Is prefect: No";
  }

  // checks if student is a member of the ingsdfhjsf squad or not and displays correct info
  if (student.squad === true) {
    document.querySelector("#detalje .squad").textContent =
      "Member of squad: Yes";
  } else {
    document.querySelector("#detalje .squad").textContent =
      "Member of squad: No";
  }

  //set theme for each house
  if (student.house == "Gryffindor") {
    setTheme("gryffindor-theme");
  } else if (student.house == "Slytherin") {
    setTheme("slytherin-theme");
  } else if (student.house == "Hufflepuff") {
    setTheme("hufflepuff-theme");
  } else if (student.house == "Ravenclaw") {
    setTheme("ravenclaw-theme");
  }

  document
    .querySelector(".expel-button")
    .addEventListener("click", expelStudent);

  function expelStudent() {
    console.log(student);
    const index = cleanedData.indexOf(student);
    expelledStudents.push(student);
    cleanedData.splice(index, 1);
    console.log(cleanedData);
    console.log(expelledStudents);
    displayListOfStudents(cleanedData);
    detalje.classList.add("hide");
  }
}

// function to set a given theme/color-scheme, siger at navnet på themet skal være classe navnet
function setTheme(themeName) {
  localStorage.setItem("theme", themeName);
  document.documentElement.className = themeName;
}

// filtering functions
function selectFilter() {
  currentFilter = this.value;
  buildList();
}

function filterList() {
  if (currentFilter === "hufflepuff") {
    const filteredList = cleanedData.filter(filterHufflepuff);
    return filteredList;
  } else if (currentFilter === "gryffindor") {
    const filteredList = cleanedData.filter(filterGryffindor);
    return filteredList;
  } else if (currentFilter === "slytherin") {
    const filteredList = cleanedData.filter(filterSlytherin);
    return filteredList;
  } else if (currentFilter === "ravenclaw") {
    const filteredList = cleanedData.filter(filterRavenclaw);
    return filteredList;
  } else if (currentFilter === "expelled") {
    const filteredList = expelledStudents;
    return filteredList;
  } else {
    return cleanedData;
  }
}

function filterGryffindor(student) {
  if (student.house === "Gryffindor") {
    return true;
  } else {
    return false;
  }
}

function filterHufflepuff(student) {
  if (student.house === "Hufflepuff") {
    return true;
  } else {
    return false;
  }
}

function filterSlytherin(student) {
  if (student.house === "Slytherin") {
    return true;
  } else {
    return false;
  }
}

function filterRavenclaw(student) {
  if (student.house === "Ravenclaw") {
    return true;
  } else {
    return false;
  }
}

function filterExpelledStudents(student) {
  if (student.expelled === true) {
    return true;
  } else {
    return false;
  }
}

//sorting functions

function selectSorting() {
  currentSorting = this.value;
  buildList();
}

function sortList(currentList) {
  if (currentSorting === "firstname") {
    const sorteredList = currentList.sort(sortByFirstName);
    return sorteredList;
  } else if (currentSorting === "lastname") {
    const sorteredList = currentList.sort(sortByLastName);
    return sorteredList;
  } else if (currentSorting === "house") {
    const sorteredList = currentList.sort(sortByHouse);
    return sorteredList;
  }
}

function sortByFirstName(a, b) {
  if (a.firstname < b.firstname) {
    return -1;
  } else {
    return 1;
  }
}

function sortByLastName(a, b) {
  if (a.lastname < b.lastname) {
    return -1;
  } else {
    return 1;
  }
}

function sortByHouse(a, b) {
  if (a.house < b.house) {
    return -1;
  } else {
    return 1;
  }
}

// function that combines filtering and sorting and sends the list to the display students function
function buildList() {
  const currentList = filterList();
  const sortedList = sortList(currentList);
  displayListOfStudents(sortedList);
}
