"use strict";

let currentFilter = "*";
let currentSorting = "firstname";
let expelledStudents = [];
let hasBeenHacked = false;
const cleanedData = [];

// prefect arrays for each house
let gPrefects = [];
let sPrefects = [];
let hPrefects = [];
let rPrefects = [];

window.addEventListener("DOMContentLoaded", start);

// student object which is used for each student and stored in the cleanedData array
const Student = {
  firstname: "",
  middlename: "",
  lastname: "",
  nickname: "",
  image: "",
  house: "",
  bloodstatus: "",
  prefect: false,
  squad: false,
  expelled: false,
};

// calls load json function and calls function that adds event liteners to filtering and sorting
function start() {
  console.log("ready");
  addEventListenerToButtons();
  loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", prepareObjects);
  loadJSON("https://petlatkea.dk/2020/hogwarts/families.json", prepareBlood);
}

// loads data
function loadJSON(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => {
      callback(jsonData);
    });
}

// cleans data and stores in new array
function prepareObjects(jsonData) {
  //   console.log(jsonData);
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
      middleName = nameTrimmed.substring(nameTrimmed.indexOf(" ") + 1, nameTrimmed.lastIndexOf(" ") + 1);
    } else {
      student.middlename = undefined;
    }

    //  FINAL
    student.firstname = firstName.substring(0, 1).toUpperCase() + firstName.substring(1).toLowerCase();

    // checks if last name includes a hyphen before changing to uppercase and lowercase
    if (lastName.includes("-")) {
      student.lastname = lastName;
    } else {
      student.lastname = lastName.substring(0, 1).toUpperCase() + lastName.substring(1).toLowerCase();
    }

    student.middlename =
      middleName.trimEnd().substring(0, 1).toUpperCase() + middleName.trimEnd().substring(1).toLowerCase();

    student.nickname = nameTrimmed.substring(nameTrimmed.indexOf('"') + 1, nameTrimmed.lastIndexOf('"'));

    student.house =
      jsonObject.house.trim().substring(0, 1).toUpperCase() + jsonObject.house.trim().substring(1).toLowerCase();

    // navne til filnavne
    const fileLastName = lastName.toLowerCase();
    const firstCharName = firstName[0].toLowerCase();
    const fileFirstName = firstName.toLowerCase();

    if (fileLastName.includes("-")) {
      student.image = fileLastName.substring(fileLastName.indexOf("-") + 1) + "_" + firstCharName + ".png";
    } else if (nameTrimmed.includes("Patil")) {
      student.image = `${fileLastName}_${fileFirstName}.png`;
    } else if (nameTrimmed.includes(" ")) {
      student.image = `${fileLastName}_${firstCharName}.png`;
    } else {
      // til at fjerne dumme leanne
      student.image = "leanne.png";
    }

    student.bloodstatus = "Unknown";
    student.prefect = false;
    student.squad = false;
    student.expelled = false;

    //add clean data to new array
    cleanedData.push(student);
  });
  buildList();
}

function prepareBlood(families) {
  cleanedData.forEach((student) => {
    if (families.pure.includes(student.lastname)) {
      student.bloodstatus = "pure";
    } else if (families.half.includes(student.lastname)) {
      student.bloodstatus = "half";
    } else {
      student.bloodstatus = "muggleborn";
    }
  });
}

function addEventListenerToButtons() {
  document.querySelector("#filtering").addEventListener("change", selectFilter);
  document.querySelector("#sorting").addEventListener("change", selectSorting);
  document.querySelector(".searchbox").addEventListener("input", searchStudents);
}

// display list of students from our cleaned data
function displayListOfStudents(students) {
  const amountOfStudents = students.length;
  document.querySelector(".number-of-students").textContent = "Number of students displayed: " + amountOfStudents;
  console.log("students displayed");
  const template = document.querySelector("template");
  let container = document.querySelector(".data-container");

  container.innerHTML = "";

  students.forEach((student) => {
    let klon = template.cloneNode(true).content;
    klon.querySelector(".name").textContent = `${student.firstname} ${student.lastname}`;
    klon.querySelector(".house").textContent = student.house;
    klon.querySelector("article").addEventListener("click", () => visInfo(student));
    container.appendChild(klon);
  });
}

function searchStudents() {
  const searchInput = document.querySelector(".searchbox").value;

  const searchInputUpper = searchInput.substring(0, 1).toUpperCase() + searchInput.substring(1).toLowerCase();

  const searchResult = cleanedData.filter((student) => student.firstname.includes(searchInputUpper));

  displayListOfStudents(searchResult);
}

// shows details for the student that is clicked, also delegates out to other functions
function visInfo(student) {
  const detalje = document.querySelector("#detalje");
  const lukKnap = document.querySelector(".luk-knap");

  detalje.classList.remove("hide");
  lukKnap.addEventListener("click", () => {
    detalje.classList.add("hide");
    document.querySelector(".prefect-button").removeEventListener("click", unmakePrefect);
    document.querySelector(".prefect-button").removeEventListener("click", makePrefect);
    document.querySelector(".expel-button").removeEventListener("click", expelButton);
    document.querySelector(".squad-button").removeEventListener("click", removeFromSquad);
    document.querySelector(".squad-button").removeEventListener("click", addToSquad);
  });

  //set theme for each house
  if (hasBeenHacked === false) {
    setTheme(getTheme(student));
  }

  // displays info
  document.querySelector("#detalje .name").textContent = `${student.firstname} ${student.lastname}`;
  document.querySelector("#detalje .house").textContent = student.house + " House";
  document.querySelector("#detalje .image").src = "images/" + student.image;
  document.querySelector("#detalje .bloodstatus").textContent = "Bloodstatus: " + capitalize(student.bloodstatus);

  // checks if student is prefect or not and displays correct info
  if (student.prefect === true) {
    document.querySelector("#detalje .prefect").textContent = "Is prefect: Yes";
    document.querySelector(".prefect-button").textContent = "Remove prefect";
    document.querySelector(".expel-button").textContent = "Prefects cannot be expelled";
  } else if (student.prefect === false) {
    document.querySelector("#detalje .prefect").textContent = "Is prefect: No";
    document.querySelector(".prefect-button").textContent = "Make prefect";
    document.querySelector(".expel-button").textContent = "Expel student";
  }

  // checks if student is a member of the ingsdfhjsf squad or not and displays correct info
  if (student.squad === true) {
    document.querySelector("#detalje .squad").textContent = "Member of inquisitorial squad: Yes";
    document.querySelector(".squad-button").classList.remove("hide");
    document.querySelector(".squad-button").addEventListener("click", removeFromSquad);
    document.querySelector(".squad-button").textContent = "Remove from inquisitorial squad";
  } else if (student.squad === false && student.bloodstatus === "pure" && student.house === "Slytherin") {
    document.querySelector(".squad-button").classList.remove("hide");
    document.querySelector("#detalje .squad").textContent = "Member of inquisitorial squad: No";
    document.querySelector(".squad-button").addEventListener("click", addToSquad);
    document.querySelector(".squad-button").textContent = "Add to the inquisitorial squad";
  } else if (student.bloodstatus === "half" || student.bloodstatus === "muggle" || !student.house === "Slytherin") {
    document.querySelector(".squad-button").classList.add("hide");
  }

  // these two functions could be made into a single toggle function XD
  function removeFromSquad() {
    document.querySelector(".prefect-button").removeEventListener("click", unmakePrefect);
    document.querySelector(".prefect-button").removeEventListener("click", makePrefect);
    document.querySelector(".expel-button").removeEventListener("click", expelButton);
    document.querySelector(".squad-button").removeEventListener("click", removeFromSquad);
    document.querySelector(".squad-button").removeEventListener("click", addToSquad);

    student.squad = false;
    visInfo(student);
    buildList();
  }

  function addToSquad() {
    document.querySelector(".prefect-button").removeEventListener("click", unmakePrefect);
    document.querySelector(".prefect-button").removeEventListener("click", makePrefect);
    document.querySelector(".expel-button").removeEventListener("click", expelButton);
    document.querySelector(".squad-button").removeEventListener("click", removeFromSquad);
    document.querySelector(".squad-button").removeEventListener("click", addToSquad);
    student.squad = true;
    visInfo(student);
  }

  // checks if student is prefect or not and adds the correct event listener
  if (student.prefect === false) {
    document.querySelector(".prefect-button").addEventListener("click", makePrefect);
  } else if (student.prefect === true) {
    document.querySelector(".prefect-button").addEventListener("click", unmakePrefect);
  }

  function unmakePrefect() {
    console.log("Unmakeprefect");
    document.querySelector(".prefect-button").removeEventListener("click", unmakePrefect);
    document.querySelector(".prefect-button").removeEventListener("click", makePrefect);
    document.querySelector(".expel-button").removeEventListener("click", expelButton);
    document.querySelector(".squad-button").removeEventListener("click", removeFromSquad);
    document.querySelector(".squad-button").removeEventListener("click", addToSquad);

    // array used to store prefects
    let prefectArray = [];

    // sets the prefect array to be the correct array for each house
    if (student.house === "Gryffindor") {
      prefectArray = gPrefects;
    } else if (student.house === "Slytherin") {
      prefectArray = sPrefects;
    } else if (student.house === "Ravenclaw") {
      prefectArray = rPrefects;
    } else if (student.house === "Hufflepuff") {
      prefectArray = hPrefects;
    }

    // removes selected student from the prefect array and sets prefect status to false
    prefectArray.splice(prefectArray.indexOf(student), 1);
    student.prefect = false;

    // refreshes the list and pop up window
    buildList();
    visInfo(student);
  }

  function makePrefect() {
    document.querySelector(".prefect-button").removeEventListener("click", unmakePrefect);
    document.querySelector(".prefect-button").removeEventListener("click", makePrefect);
    document.querySelector(".expel-button").removeEventListener("click", expelButton);
    document.querySelector(".squad-button").removeEventListener("click", removeFromSquad);
    document.querySelector(".squad-button").removeEventListener("click", addToSquad);

    // array used to store prefects
    let prefectArray = [];

    // sets the prefect array to be the correct array for each house
    if (student.house === "Gryffindor") {
      prefectArray = gPrefects;
    } else if (student.house === "Slytherin") {
      prefectArray = sPrefects;
    } else if (student.house === "Ravenclaw") {
      prefectArray = rPrefects;
    } else if (student.house === "Hufflepuff") {
      prefectArray = hPrefects;
    }

    // checks how many students are currently prefects for the selected house
    if (prefectArray.length < 2) {
      // sets the prefect status to true and adds the prefect to the array, then refreshes the list and popup
      student.prefect = true;
      prefectArray.push(student);
      visInfo(student);
      buildList();
    } else if (prefectArray.length > 1) {
      // calls the function to remove one prefect as there are already two prefects
      removePrefect(student, prefectArray);
    }
  }

  // functiion that makes the first letter uppercase
  function capitalize(word) {
    const upperCaseWord = word.substring(0, 1).toUpperCase() + word.substring(1);
    return upperCaseWord;
  }

  // removes buttons for expelled students
  if (student.expelled === true) {
    document.querySelector(".expel-button").classList.add("hide");
    document.querySelector(".prefect-button").classList.add("hide");
  } else if (student.firstname === "Laura") {
    document.querySelector(".expel-button").textContent = "LAURA CANNOT BE EXPELLED!!!!";
  } else if (student.expelled === false && student.prefect === false) {
    // checks if student is a prefect or not, students who are prefects cannot be expelled
    document.querySelector(".expel-button").classList.remove("hide");
    document.querySelector(".prefect-button").classList.remove("hide");
    document.querySelector(".expel-button").addEventListener("click", expelButton);
  }

  function expelButton() {
    document.querySelector(".prefect-button").removeEventListener("click", unmakePrefect);
    document.querySelector(".prefect-button").removeEventListener("click", makePrefect);
    document.querySelector(".expel-button").removeEventListener("click", expelButton);
    document.querySelector(".squad-button").removeEventListener("click", removeFromSquad);
    document.querySelector(".squad-button").removeEventListener("click", addToSquad);
    expelStudent(student);
  }
}

// function to expel a student
function expelStudent(student) {
  console.log("EXPELLING A STUDENT");
  // gets index of student in the cleaned data array
  const index = cleanedData.indexOf(student);
  student.prefect = false;
  student.expelled = true;

  // removes the student from the cleaned data array
  cleanedData.splice(index, 1);

  // adds the student to the expelled students array
  expelledStudents.push(student);

  // refreshes the list

  buildList();

  // hides pop up and removes event listener
  detalje.classList.add("hide");
}

// function that gives makes the user choose which prefect to replace
function removePrefect(student, prefectArray) {
  document.querySelector("#remove-prefect").classList.remove("hide");

  const button1 = document.querySelector(".option1");
  const button2 = document.querySelector(".option2");

  button1.textContent = prefectArray[0].firstname;
  button2.textContent = prefectArray[1].firstname;

  button1.addEventListener("click", removeOption1);
  button2.addEventListener("click", removeOption2);

  function removeOption1() {
    replacePrefect(prefectArray, student, prefectArray[0]);
  }

  function removeOption2() {
    replacePrefect(prefectArray, student, prefectArray[1]);
  }
}

// replaces the chosen student another prefect
function replacePrefect(prefectArray, student, studentToReplace) {
  prefectArray.splice(prefectArray.indexOf(studentToReplace), 1);
  prefectArray.push(student);

  studentToReplace.prefect = false;
  student.prefect = true;

  document.querySelector("#remove-prefect").classList.add("hide");
  visInfo(student);
  buildList();
}

function getTheme(student) {
  if (student.house == "Gryffindor") {
    const themeName = "gryffindor-theme";
    return themeName;
  } else if (student.house == "Slytherin") {
    const themeName = "slytherin-theme";
    return themeName;
  } else if (student.house == "Hufflepuff") {
    const themeName = "hufflepuff-theme";
    return themeName;
  } else if (student.house == "Ravenclaw") {
    const themeName = "ravenclaw-theme";
    return themeName;
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
  } else if (currentFilter === "prefects") {
    const filteredList = cleanedData.filter(filterPrefect);
    return filteredList;
  } else if (currentFilter === "squad") {
    const filteredList = cleanedData.filter(filterSquad);
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

function filterPrefect(student) {
  if (student.prefect === true) {
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

function filterSquad(student) {
  if (student.squad === true) {
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

function hackTheSystem() {
  hasBeenHacked = true;

  // styling that is changed when hacked
  setTheme("hacked-theme");
  document.querySelector("button").style.backgroundColor = "red";
  document.querySelector(".expel-button").style.backgroundColor = "red";
  document.querySelector(".prefect-button").style.backgroundColor = "red";
  document.querySelector(".squad-button").style.backgroundColor = "red";
  document.querySelector(".yellowfont").style.color = "red";
  document.querySelector(".number-of-students").style.color = "red";
  document.querySelector("body").style.background =
    "linear-gradient(180deg, rgba(235,235,235,1) 0%, rgba(255,0,0,1) 55%)";

  // create an object for myself to insert into the array
  const myself = Object.create(Student);
  myself.firstname = "Laura";
  myself.middleName = "Toft";
  myself.lastname = "Ragnarsdottir";
  myself.house = "Ravenclaw";
  myself.image = "mussi.jpg";
  myself.bloodstatus = "pure";

  console.log(myself);
  cleanedData.push(myself);
  buildList();

  cleanedData.forEach((student) => {
    if (student.bloodstatus === "pure") {
      const values = ["pure", "half", "muggleborn"];

      const random = Math.floor(Math.random() * values.length);
      student.bloodstatus = values[random];
    } else if (student.bloodstatus === "muggleborn" || student.bloodstatus === "half") {
      student.bloodstatus = "pure";
    }
  });
}
