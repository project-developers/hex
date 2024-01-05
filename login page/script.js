var navigationVue, allPublishersVue, congregationVue, fieldServiceGroupsVue;
var allButtons = [{"title": "Congregation Information", "function": "congregationVue"}, {"title": "All Publishers", "function": "allPublishersVue"}, {"title": "Field Service Groups", "function": "fieldServiceGroupsVue"}, {"title": "All Contact Information", "function": "congregationVue"}, {"title": "Monthly Report", "function": "congregationVue"}]
var CongregationData = JSON.parse(localStorage.getItem('CongregationData'));

document.querySelector('#navigation').innerHTML = `<template>
	<div style="display:flex">
		<button v-for="(button, count) in buttons" :key="count" @click="openButton($event.target)">{{ button.title }}</button>
		<div v-if="display == true" style="display:flex">
			<select v-model="fieldServiceGroup" style="margin:1px">
				<option v-if="allGroups.length > 1" value="All Field Service Groups">All Field Service Groups</option>
				<option v-for="group in allGroups" :key="group" :value="group">{{ group }}</option>
			</select>
			<div class="my-searchbox-holder" style="margin: 10px; width: 200px;">
				<div class="my-searchbox">
					<span>🔍</span>
					<input 
						v-model="searchTerms" 
						placeholder="Name, Address or Phone Number" 
						type="text" 
						@keydown.enter="filteredViews" 
						@keydown.esc="clearFilter"
						@focus="boldBox"
						@focusout="unboldBox"
					>
					<button @click="clearFilter">x</button>
					<button @click="filteredViews">➔</button>
				</div>
			</div>
		</div>
	</div>
</template>`

function processNavigation() {

    navigationVue = new Vue({
        el: document.querySelector('#navigation'),
        data: {
            buttons: [{"title": "All Publishers", "function": "allPublishersVue"}, {"title": "Field Service Groups", "function": "fieldServiceGroupsVue"}, {"title": "All Contact Information", "function": "congregationVue"}, {"title": "Monthly Report", "function": "congregationVue"}],
            fieldServiceGroup: 'All Field Service Groups',
			searchTerms: '',
			display: false,
        },
        computed: {
            allCharacters() {/*
                return getUniqueElementsByProperty(this.clickedSectionFilter,['ID'])*/
            },
			allGroups() {
                return getUniqueElementsByProperty(CongregationData,['fieldServiceGroup']).map(elem=>elem.fieldServiceGroup).sort()
            },
        },
        methods: {
			openButton(button) {
				this.buttons = allButtons.filter(elem=>elem.title !== button.innerHTML)
				gotoView(allButtons.filter(elem=>elem.title == button.innerHTML)[0].function)
			},
			filteredViews() {

			},
			clearFilter() {
				
			},
			boldBox() {
				
			},
			unboldBox() {
				
			}
        }
    })
}

processNavigation()

function gotoView(button) {
	congregationVue.display = false
	allPublishersVue.display = false
	fieldServiceGroupsVue.display = false
	if (button == "congregationVue") {
		navigationVue.display = false
	} else {
		navigationVue.display = true
	}
	window[`${button}`].display = true
}

document.querySelector('#congregation').innerHTML = `<template>
    <div v-if="display == true">
		<h1>{{ congregation.name }}</h1>
		<h2>{{ congregation.address }}</h2>
		<h3>{{ congregation.email }}</h3>
		<h3>{{ publishersCount }} {{ publishersCount <= 1 ? 'Publisher' : 'Publishers' }}</h3>
	</div>
</template>`

function processCongregation() {

    congregationVue = new Vue({
        el: document.querySelector('#congregation'),
        data: {
            congregation: {"name": "New England", "address": "14 Hannesson Street, New England Ville.", "email": "cong574356@jwpub.org"},
            display: true,
        },
        computed: {
            publishersCount() {
                return allPublishersVue.publishers.length
            },
        },
        methods: {
			
        }
    })
}

document.querySelector('#allPublishers').innerHTML = `<template>
	<div v-if="display == true">
		<section>
			<ol>
				<li v-for="(publisher, count) in publishers" :key="publisher.name + '|' + publisher.fieldServiceGroup" style="cursor:pointer">{{ publisher.name }}</li>
			</ol>
		</section>
    </div>
</template>`

function processAllPublishers() {

    allPublishersVue = new Vue({
        el: document.querySelector('#allPublishers'),
        data: {
            publishers: [],
            display: false,
        },
        computed: {
            allCharacters() {/*
                return getUniqueElementsByProperty(this.clickedSectionFilter,['ID'])*/
            },
        },
        methods: {
        }
    })
}

document.querySelector('#fieldServiceGroups').innerHTML = `<template>
	<div v-if="display == true">
		<main class="grid-parent">		
			<section v-for="(group) in allGroups" :key="group" v-if="selectedGroup == group || selectedGroup == 'All Field Service Groups'" class="grid-item">
				<h2 v-if="groupPublishers(group).length !== 0" class="main card-title" style="cursor:pointer">{{ group }}</h2>
				<ol>
					<li v-for="(publisher, count) in groupPublishers(group)" :key="publisher + '|' + count" style="cursor:pointer" v-if="publisher.name.toLowerCase().includes(searchTerms) || publisher.contactInformation.address.toLowerCase().includes(searchTerms) || publisher.contactInformation.phoneNumber.toLowerCase().includes(searchTerms)">{{ publisher.name }}</li>
				</ol>
			</section>
		</main>
    </div>
</template>`

function processFieldServiceGroups() {

    fieldServiceGroupsVue = new Vue({
        el: document.querySelector('#fieldServiceGroups'),
        data: {
            publishers: [],
            display: false,
        },
        computed: {
            searchTerms() {
                return navigationVue.searchTerms
            },
			allGroups() {
                return getUniqueElementsByProperty(allPublishersVue.publishers,['fieldServiceGroup']).map(elem=>elem.fieldServiceGroup).sort()
            },
			selectedGroup() {
                return navigationVue.fieldServiceGroup
            },
        },
        methods: {
			groupPublishers(group) {
                return allPublishersVue.publishers.filter(elem=>elem.fieldServiceGroup == group)
            },
        }
    })
}

processAllPublishers()
processCongregation()
processFieldServiceGroups()

var newPublisherRecord = CongregationData.shift()
allPublishersVue.publishers = CongregationData

function getUniqueElementsByProperty(arr, propNames) {
    const uniqueSet = new Set();
    
    return arr.filter(obj => {
        const key = propNames.map(prop => obj[prop]).join('|');
        if (!uniqueSet.has(key)) {
            uniqueSet.add(key);
            return true;
        }
        return false;
    });
}

/*
let toggle = 0;

function navigation(){
	if(toggle == 0){
		
		document.getElementById('fieldServiceGroups').style.display = 'block';
		document.getElementById('contactInformation').style.display = 'block';
		document.getElementById('settings').style.display = 'block';
		document.getElementById('report').style.display = 'block';
		table();
		document.getElementById('monthlyReport').style.display = 'none';
		document.getElementById('missingReport').style.display = 'none';
		document.getElementById('branch').style.display = 'none';
		document.getElementById('cong').style.display = 'none';
		toggle = 1;
	}else{
		document.getElementById('fieldServiceGroups').style.display = 'none';
		document.getElementById('contactInformation').style.display = 'none';
		document.getElementById('settings').style.display = 'none';
		document.getElementById('report').style.display = 'none';
		table();
		document.getElementById('monthlyReport').style.display = 'block';
		document.getElementById('missingReport').style.display = 'block';
		document.getElementById('branch').style.display = 'block';
		document.getElementById('cong').style.display = 'block';
		toggle = 0;
	}
}

document.getElementById('cong').addEventListener('click', navigation);
document.getElementById('report').addEventListener('click', navigation);

const newPublisher = document.getElementById('newPublisher');
newPublisher.addEventListener('click', addNewPublisher);

function addNewPublisher(){
	
	
	const newCard = JSON.parse(JSON.stringify(congregationData));
	//const newCard = [...congregationData];
	congregationData.push(newCard[0]);
	var input;
	input = prompt("Publisher Name", congregationData[congregationData.length - 1].name);
	if (input === null) {
		congregationData.pop();
		return; // break out of the function early
	}
	congregationData[congregationData.length - 1].name = input
	
	input = prompt("Field Service Group", congregationData[congregationData.length - 1].fieldServiceGroup);
	if (input === null) {
		congregationData.pop();
		return; // break out of the function early
	}
	congregationData[congregationData.length - 1].fieldServiceGroup = input;
	localStorage.removeItem('CongregationData');
	const card = congregationData.shift();
	
	congregationData.sort(function(a, b) {
		var nameA = a.name.toUpperCase(); // ignore upper and lowercase
		var nameB = b.name.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		
		//names must be equal
		return 0;
	});
	
	congregationData.unshift(card);

	createRecord();
	processRecord();
	table();
	//resetEntry();
	branchRecord();
	datasetMain();
	localStorage.setItem('CongregationData', JSON.stringify(congregationData));
	console.log('New Publisher Added')
}


const button = document.querySelector('.button');

const add = document.querySelector('.add');

const MonthlyRecord = JSON.parse(localStorage.getItem('MonthlyRecord'));

const PastReport = JSON.parse(localStorage.getItem('LateRecord'));
*/
//const Groups = JSON.parse(localStorage.getItem('Groups'));

/*
const Attendance = JSON.parse(localStorage.getItem('Attendance'));

var monthlyRecord = [];

var missingReport = "";

var allReport = [];

var publisherReport, auxiliaryPioneerReport, regularPioneerReport;
var pubReport = [], auxReport = [], regReport = [];

var groups = [];

var reports = "";

var lateReport = "";

var yr;

window.onload = function(){
	document.getElementById("month1").style.display='none';
	navigation();

	if(PastReport){
	pastReport = PastReport;
	};
	
	if(CongregationData){
	congregationData = CongregationData;
	};
	
	if(Attendance){
	attendance = Attendance;
	};

	if(MonthlyRecord){

	monthlyRecord = MonthlyRecord;
	processRecord();
	table();
	dataset1();
	branchRecord();
	return;
	}

		datasetMain();
		createRecord();
		processRecord();
		table();
		dataset1();
		branchRecord();
		
location.hash = "#cong";
};

var input = document.getElementsByTagName('input')[0];

input.onkeypress = input. onkeydown = function() {
	this.size = ( this.value.length > 10 ) ? this.value.length : 10;
};

  var months = new Array();
  months[0] = "January";
  months[1] = "February";
  months[2] = "March";
  months[3] = "April";
  months[4] = "May";
  months[5] = "June";
  months[6] = "July";
  months[7] = "August";
  months[8] = "September";
  months[9] = "October";
  months[10] = "November";
  months[11] = "December";

  var d = new Date();
  var m;
  if((d.getMonth()-1) < 0){
	  m = months[11];
  }else{
	  m = months[d.getMonth()-1];
  }; 
  

var options1 = '';

for (var i = 0; i < months.length; i++) {
  options1 += '<option value="' + months[i] + '" />';
};

document.getElementById("month").innerHTML = options1;

function later(){
	var checkbox = document.getElementById("lateReport1");
	var month = document.getElementById("month1");

	if (checkbox.checked == true){
		month.style.display = "block";
		dataset2()
	} else {
		month.style.display = "none";
		dataset1()
	}
};

document.querySelector('.button').innerText = 'Download';

function dataset1(){

var options = '';

for (var i = 1; i < congregationData.length; i++) {

if(monthlyRecord[i][3] !== "" && toggle == 1){
			continue;
		}
  options += '<option value="' + monthlyRecord[i][0] + '" />';
};
document.getElementById('publisherName').innerHTML = options;
return options;
};

function dataset2(){
var options = '';
for (var i = 1; i < congregationData.length; i++) {
  options += '<option value="' + congregationData[i].name + '" />';
};
document.getElementById('publisherName').innerHTML = options;
};

function datasetMain(){
var options = '';
for (var i = 1; i < congregationData.length; i++) {
  options += '<option value="' + congregationData[i].name + '" />';
};
document.getElementById('publisherName').innerHTML = options;
};

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
};


const saveToComputer = () => {
	if (confirm('Press "OK" to Download Record')){
	var mon = arrayToObject(CongregationData);
	//var past = arrayToObject(pastReport);
	
	allReport.push(mon);
	//allReport.push(past);
	download(JSON.stringify(congregationData), 'Monthly Report.csv', 'text/plain');
	localStorage.removeItem('CongregationData');
	//localStorage.removeItem('Groups');
	localStorage.removeItem('MonthlyRecord');
	localStorage.removeItem('LateRecord');
	} else {
		return;
	}
};

button.addEventListener('click', saveToComputer);

function attProcess() {
	
	var weekCount = 0, weekendCount = 0;
	
	
	attendance.week1.midweek = prompt("Please enter 1st Midweek Attendance", attendance.week1.midweek);
	if(+attendance.week1.midweek > 0){weekCount++};
	attendance.week1.weekend = prompt("Please enter 1st Weekend Attendance", attendance.week1.weekend);
	if(+attendance.week1.weekend > 0){weekendCount++};
	
	attendance.week2.midweek = prompt("Please enter 2nd Midweek Attendance", attendance.week2.midweek);
	if(+attendance.week2.midweek > 0){weekCount++};
	attendance.week2.weekend = prompt("Please enter 2nd Weekend Attendance", attendance.week2.weekend);
	if(+attendance.week2.weekend > 0){weekendCount++};
	
	attendance.week3.midweek = prompt("Please enter 3rd Midweek Attendance", attendance.week3.midweek);
	if(+attendance.week3.midweek > 0){weekCount++};
	attendance.week3.weekend = prompt("Please enter 3rd Weekend Attendance", attendance.week3.weekend);
	if(+attendance.week3.weekend > 0){weekendCount++};
	
	attendance.week4.midweek = prompt("Please enter 4th Midweek Attendance", attendance.week4.midweek);
	if(+attendance.week4.midweek > 0){weekCount++};
	attendance.week4.weekend = prompt("Please enter 4th Weekend Attendance", attendance.week4.weekend);
	if(+attendance.week4.weekend > 0){weekendCount++};
	
	attendance.week5.midweek = prompt("Please enter 5th Midweek Attendance", attendance.week5.midweek);
	if(+attendance.week5.midweek > 0){weekCount++};
	attendance.week5.weekend = prompt("Please enter 5th Weekend Attendance", attendance.week5.weekend);
	if(+attendance.week5.weekend > 0){weekendCount++};
	
	attendance.total.weekend = +attendance.week1.weekend + +attendance.week2.weekend + +attendance.week3.weekend + +attendance.week4.weekend + +attendance.week5.weekend;
	attendance.total.midweek = +attendance.week1.midweek + +attendance.week2.midweek + +attendance.week3.midweek + +attendance.week4.midweek + +attendance.week5.midweek;
	attendance.average.weekend = attendance.total.weekend/weekendCount;
	attendance.average.midweek = attendance.total.midweek/weekCount;
	
	localStorage.setItem('Attendance', JSON.stringify(attendance));
	
}

var attendance = {
week1: {weekend: "", midweek: ""},
week2: {weekend: "", midweek: ""},
week3: {weekend: "", midweek: ""},
week4: {weekend: "", midweek: ""},
week5: {weekend: "", midweek: ""},
total: {weekend: 0, midweek: 0},
average: {weekend: 0, midweek: 0}
};

function arrayToObject(arr) {
	var obj = {};
	var map = [];
	for (var i = 1; i < arr.length; i++){
		map[i - 1] = [];
		for (var j = 0; j < arr[i].length; j++){
			map[i - 1][j] = [];
			map[i - 1][j].push(arr[0][j]);
			map[i - 1][j].push(arr[i][j]);
		};
		obj[i - 1] = Object.fromEntries(map[i - 1]);
	}
	return obj;
}

function table(){

	missingReport = "";

	for(var i = 1; i < congregationData.length; i++){
			
		if(!groups.includes(congregationData[i].fieldServiceGroup)){
		groups.push(congregationData[i].fieldServiceGroup);
		};
	};
	
	groups = groups.sort();
	
	if(congregationData.length > 0){
	yr = congregationData[1].report.serviceYear1.year;
	}

	var x = -1;

		while(x < groups.length - 1){
		x++;
		
	missingReport += "<div id='tab'><h3>" + groups[x] + "</h3><table><tr>";

	var a = 1;	

	for(var i = 1; i < congregationData.length; i++) {

		if(congregationData[i].fieldServiceGroup == groups[x]){		

		if(monthlyRecord[i][3] !== "" && toggle == 1){
			continue
		}

		missingReport += "</tr><tr>";
		missingReport += "<td>" + a + "</td>";
		missingReport += "<td>" + congregationData[i].name + "</td>";
		a++;
		};
	};
		
	missingReport += "</tr></table></div>";
			};
	missingReport += "";
	localStorage.setItem('Groups', JSON.stringify(groups));
};			
var heading = ["Placements","Video Showings","Hours","Return Visits","Bible Studies","Remarks"];
var pubRec, auxPio, regPio;

function createRecord(){
		
	heading = ["Placements","Video Showings","Hours","Return Visits","Bible Studies","Remarks"];
	heading.unshift("Publisher Name");
	monthlyRecord[0] = [];
	monthlyRecord[0] = heading;

	for(var i = 1; i < congregationData.length; i++){
		monthlyRecord[i] = [];
		monthlyRecord[i].push(congregationData[i].name);
		
		//for(var j = 1; j < heading.length; j++){
		//monthlyRecord[i + 1].push("");
		
		
		if(m=="January") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jan.placements);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jan.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jan.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jan.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jan.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jan.remarks);
		}else if(m=="February") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.feb.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.feb.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.feb.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.feb.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.feb.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.feb.remarks);
		}else if(m=="March") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.mar.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.mar.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.mar.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.mar.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.mar.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.mar.remarks);
		}else if(m=="April") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.apr.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.apr.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.apr.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.apr.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.apr.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.apr.remarks);
		}else if(m=="May") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.may.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.may.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.may.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.may.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.may.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.may.remarks);
		}else if(m=="June") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jun.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jun.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jun.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jun.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jun.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jun.remarks);
		}else if(m=="July") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jul.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jul.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jul.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jul.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jul.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.jul.remarks);
		}else if(m=="August") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.aug.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.aug.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.aug.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.aug.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.aug.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.aug.remarks);
		}else if(m=="September") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.sept.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.sept.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.sept.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.sept.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.sept.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.sept.remarks);
		}else if(m=="October") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.oct.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.oct.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.oct.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.oct.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.oct.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.oct.remarks);
		}else if(m=="November") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.nov.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.nov.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.nov.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.nov.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.nov.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.nov.remarks);
		}else if(m=="December") {
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.dec.placements);//("");
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.dec.videoShowings);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.dec.hours);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.dec.returnVisits);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.dec.bibleStudies);
		monthlyRecord[i].push(congregationData[i].report.serviceYear1.dec.remarks);
		};
		
		//};
	};
};

function processRecord(){

	reports = "";

	reports += "<table><tr>"
monthlyRecord.forEach(function(row){
	reports += "</tr><tr>";
	row.forEach(function(col){
	 	reports += "<td>" + col + "</td>";
	});
});
reports += "</tr></table>";

	lateReport = "";
	lateReport += "<p><h2>Late Report</h2></p>";
	lateReport += "<table><tr>"
pastReport.forEach(function(row){
	lateReport += "</tr><tr>";
	row.forEach(function(col){
	 	lateReport += "<td>" + col + "</td>";
	});
});
lateReport += "</tr></table>";

};


var pastReport = [];
pastReport[0] = [];
heading.forEach(function(e){
	pastReport[0].push(e);
});
pastReport[0].unshift("Publisher Name");
pastReport[0].push("Month");

function enterRecord(){
	
	var checkbox = document.getElementById("lateReport1");
	
	var report = [];
	if (checkbox.checked == true){
		
		if(document.getElementById("publisher").value == ""){
			alert("Please Select Publisher");
			return;
		};
		if(document.getElementById("month1").value == ""){
			alert("Please Select Month");
			return;
		};

		if(document.getElementById("hours").value == "" && document.getElementById("remarks").value !== "Preached"){
				alert("Please Enter Hours");
				return;

		};
		
		var publi = [];
		for(var i = 1; i < congregationData.length; i++){
		publi.push(congregationData[i].name);
		};
		
		var o = pastReport.length;
		
		pastReport[o] = [];
		pastReport[o].push(document.getElementById("publisher").value);
		pastReport[o].push(document.getElementById("placements").value);
		pastReport[o].push(document.getElementById("videoShowings").value);
		pastReport[o].push(document.getElementById("hours").value);
		pastReport[o].push(document.getElementById("returnVisits").value);
		pastReport[o].push(document.getElementById("bibleStudies").value);
		pastReport[o].push(document.getElementById("remarks").value);
		pastReport[o].push(document.getElementById("month1").value);
		
		var x = publi.indexOf(pastReport[o][0]);
		
		if(pastReport[o][7]=="January") {
		congregationData[x].report.serviceYear1.jan.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.jan.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.jan.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.jan.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.jan.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.jan.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="February") {
		congregationData[x].report.serviceYear1.feb.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.feb.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.feb.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.feb.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.feb.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.feb.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="March") {
		congregationData[x].report.serviceYear1.mar.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.mar.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.mar.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.mar.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.mar.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.mar.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="April") {
		congregationData[x].report.serviceYear1.apr.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.apr.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.apr.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.apr.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.apr.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.apr.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="May") {
		congregationData[x].report.serviceYear1.may.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.may.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.may.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.may.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.may.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.may.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="June") {
		congregationData[x].report.serviceYear1.jun.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.jun.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.jun.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.jun.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.jun.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.jun.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="July") {
		congregationData[x].report.serviceYear1.jul.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.jul.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.jul.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.jul.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.jul.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.jul.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="August") {
		congregationData[x].report.serviceYear1.aug.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.aug.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.aug.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.aug.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.aug.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.aug.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="September") {
		congregationData[x].report.serviceYear1.sept.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.sept.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.sept.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.sept.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.sept.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.sept.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="October") {
		congregationData[x].report.serviceYear1.oct.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.oct.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.oct.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.oct.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.oct.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.oct.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="November") {
		congregationData[x].report.serviceYear1.nov.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.nov.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.nov.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.nov.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.nov.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.nov.remarks = pastReport[o][6];
		}else if(pastReport[o][7]=="December") {
		congregationData[x].report.serviceYear1.dec.placements = pastReport[o][1];
		congregationData[x].report.serviceYear1.dec.videoShowings = pastReport[o][2];
		congregationData[x].report.serviceYear1.dec.hours = pastReport[o][3];
		congregationData[x].report.serviceYear1.dec.returnVisits = pastReport[o][4];
		congregationData[x].report.serviceYear1.dec.bibleStudies = pastReport[o][5];
		congregationData[x].report.serviceYear1.dec.remarks = pastReport[o][6];
		};



	} else {

				

		if(document.getElementById("publisher").value == ""){

			alert("Please Select Publisher");

			return;

		};

		if(document.getElementById("hours").value == "" && document.getElementById("remarks").value !== "Preached"){

				alert("Please Enter Hours");

				return;

		};

		var pub = [];

		report.push(document.getElementById("publisher").value);
		report.push(document.getElementById("placements").value);
		report.push(document.getElementById("videoShowings").value);
		report.push(document.getElementById("hours").value);
		report.push(document.getElementById("returnVisits").value);
		report.push(document.getElementById("bibleStudies").value);
		report.push(document.getElementById("remarks").value);

		monthlyRecord.forEach(function(row){
		pub.push(row[0]);
		});
		var x = pub.indexOf(report[0]);
		
		for(var i = 1; i < report.length; i++){
		monthlyRecord[x][i] = report[i];
		};
	
	
		if(m=="January") {
		congregationData[x].report.serviceYear1.jan.placements = report[1];
		congregationData[x].report.serviceYear1.jan.videoShowings = report[2];
		congregationData[x].report.serviceYear1.jan.hours = report[3];
		congregationData[x].report.serviceYear1.jan.returnVisits = report[4];
		congregationData[x].report.serviceYear1.jan.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.jan.remarks = report[6];
		}else if(m=="February") {
		congregationData[x].report.serviceYear1.feb.placements = report[1];
		congregationData[x].report.serviceYear1.feb.videoShowings = report[2];
		congregationData[x].report.serviceYear1.feb.hours = report[3];
		congregationData[x].report.serviceYear1.feb.returnVisits = report[4];
		congregationData[x].report.serviceYear1.feb.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.feb.remarks = report[6];
		}else if(m=="March") {
		congregationData[x].report.serviceYear1.mar.placements = report[1];
		congregationData[x].report.serviceYear1.mar.videoShowings = report[2];
		congregationData[x].report.serviceYear1.mar.hours = report[3];
		congregationData[x].report.serviceYear1.mar.returnVisits = report[4];
		congregationData[x].report.serviceYear1.mar.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.mar.remarks = report[6];
		}else if(m=="April") {
		congregationData[x].report.serviceYear1.apr.placements = report[1];
		congregationData[x].report.serviceYear1.apr.videoShowings = report[2];
		congregationData[x].report.serviceYear1.apr.hours = report[3];
		congregationData[x].report.serviceYear1.apr.returnVisits = report[4];
		congregationData[x].report.serviceYear1.apr.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.apr.remarks = report[6];
		}else if(m=="May") {
		congregationData[x].report.serviceYear1.may.placements = report[1];
		congregationData[x].report.serviceYear1.may.videoShowings = report[2];
		congregationData[x].report.serviceYear1.may.hours = report[3];
		congregationData[x].report.serviceYear1.may.returnVisits = report[4];
		congregationData[x].report.serviceYear1.may.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.may.remarks = report[6];
		}else if(m=="June") {
		congregationData[x].report.serviceYear1.jun.placements = report[1];
		congregationData[x].report.serviceYear1.jun.videoShowings = report[2];
		congregationData[x].report.serviceYear1.jun.hours = report[3];
		congregationData[x].report.serviceYear1.jun.returnVisits = report[4];
		congregationData[x].report.serviceYear1.jun.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.jun.remarks = report[6];
		}else if(m=="July") {
		congregationData[x].report.serviceYear1.jul.placements = report[1];
		congregationData[x].report.serviceYear1.jul.videoShowings = report[2];
		congregationData[x].report.serviceYear1.jul.hours = report[3];
		congregationData[x].report.serviceYear1.jul.returnVisits = report[4];
		congregationData[x].report.serviceYear1.jul.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.jul.remarks = report[6];
		}else if(m=="August") {
		congregationData[x].report.serviceYear1.aug.placements = report[1];
		congregationData[x].report.serviceYear1.aug.videoShowings = report[2];
		congregationData[x].report.serviceYear1.aug.hours = report[3];
		congregationData[x].report.serviceYear1.aug.returnVisits = report[4];
		congregationData[x].report.serviceYear1.aug.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.aug.remarks = report[6];
		}else if(m=="September") {
		congregationData[x].report.serviceYear1.sept.placements = report[1];
		congregationData[x].report.serviceYear1.sept.videoShowings = report[2];
		congregationData[x].report.serviceYear1.sept.hours = report[3];
		congregationData[x].report.serviceYear1.sept.returnVisits = report[4];
		congregationData[x].report.serviceYear1.sept.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.sept.remarks = report[6];
		}else if(m=="October") {
		congregationData[x].report.serviceYear1.oct.placements = report[1];
		congregationData[x].report.serviceYear1.oct.videoShowings = report[2];
		congregationData[x].report.serviceYear1.oct.hours = report[3];
		congregationData[x].report.serviceYear1.oct.returnVisits = report[4];
		congregationData[x].report.serviceYear1.oct.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.oct.remarks = report[6];
		}else if(m=="November") {
		congregationData[x].report.serviceYear1.nov.placements = report[1];
		congregationData[x].report.serviceYear1.nov.videoShowings = report[2];
		congregationData[x].report.serviceYear1.nov.hours = report[3];
		congregationData[x].report.serviceYear1.nov.returnVisits = report[4];
		congregationData[x].report.serviceYear1.nov.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.nov.remarks = report[6];
		}else if(m=="December") {
		congregationData[x].report.serviceYear1.dec.placements = report[1];
		congregationData[x].report.serviceYear1.dec.videoShowings = report[2];
		congregationData[x].report.serviceYear1.dec.hours = report[3];
		congregationData[x].report.serviceYear1.dec.returnVisits = report[4];
		congregationData[x].report.serviceYear1.dec.bibleStudies = report[5];
		congregationData[x].report.serviceYear1.dec.remarks = report[6];
		};
	}

	processRecord();
	localStorage.removeItem('CongregationData');
	localStorage.removeItem('MonthlyRecord');
	localStorage.removeItem('LateRecord');
	if(toggle == 0){
		toggle = 1;
	}else{
		toggle = 0;
	};
	table();
	if(toggle == 0){
		toggle = 1;
	}else{
		toggle = 0;
	};
	resetEntry();
	branchRecord();
	localStorage.setItem('MonthlyRecord', JSON.stringify(monthlyRecord));
	localStorage.setItem('LateRecord', JSON.stringify(pastReport));
	localStorage.setItem('CongregationData', JSON.stringify(congregationData));

};



function resetEntry(){

	document.getElementById("publisher").value = ""
	document.getElementById("placements").value = ""
	document.getElementById("videoShowings").value = ""
	document.getElementById("hours").value = ""
	document.getElementById("returnVisits").value = ""
	document.getElementById("bibleStudies").value = ""
	document.getElementById("remarks").value = "";
	document.getElementById("month1").value = "";
	document.getElementById("lateReport1").checked = false;
	document.getElementById("month1").style.display = "none";

};


const addItem = () => {

	enterRecord();
	
	branchRecord();
	
	dataset1();

};

add.addEventListener('click', addItem);

var myArray, cong, congregationData = [];

function parseCSV(file, delimiter, callback) {
  var reader = new FileReader();

  // When the FileReader has loaded the file...
  reader.onload = function() {
  
    // Split the result to an array of lines
    var lines = this.result.split(', ');
 
	var result = lines
	
    callback(result);
  }
  
  // Read the file content as a single string
  reader.readAsText(file);
};

var allCSV = [];
var head, tail;

function addCSV(csv){

head = csv[0];
tail = csv;
if(fileName[0].name == "Attendance.csv"){ 
	localStorage.setItem('Attendance', head);
	return;
}

localStorage.removeItem('CongregationData');
localStorage.removeItem('MonthlyRecord');
localStorage.removeItem('LateRecord');

localStorage.setItem('CongregationData', head);
//localStorage.setItem('Attendance', tail);

csv.forEach(function(e){
				allCSV.push(e);
			});

var attrs = csv.splice(0,1);

var result = csv.map(function(row) {
  var obj = {};
  var rowData = row.split(',');
  attrs[0].split(',').forEach(function(val, idx) {
    obj = constructObj(val, obj, rowData[idx]);
  });
  return obj;
})


function constructObj(str, parentObj, data) {
  if(str.split('/').length === 1) {
    parentObj[str] = data;
    return parentObj;
  }

  var curKey = str.split('/')[0];
  if(!parentObj[curKey])
    parentObj[curKey] = {};
  parentObj[curKey] = constructObj(str.split('/').slice(1).join('/'), parentObj[curKey], data);
  return parentObj;
}

return result;

};

var fileName;

document.querySelector('input[type="file"]')
	.addEventListener('change', function() {
	var files = this.files;
	//console.log(files);
	fileName = files;
	var newArray = [];
	//localStorage.removeItem('congregationData');
  for (var i = 0; i < files.length; i++) {
  	parseCSV(files[i], ',', function(result) {
    	//console.log(files[i]);
		
		myArray = [];
		myArray.push(result);
		newArray.push(addCSV(myArray[0]));
		if(fileName[0].name == "Attendance.csv"){ 
		return;
		}
		newArray[0].sort();
		congregationData = [];
		//congregationData.sort();
		congregationData = JSON.parse(localStorage.getItem('CongregationData'));
		//localStorage.setItem('CongregationData', JSON.stringify(congregationData));
		cong = congregationData.map(obj => Object.values(obj));
		//document.querySelector('.button').innerText = 'Process';
		//document.getElementById('button').click();
		//buttonName = 1;
		datasetMain();
		createRecord();
		processRecord();
		table();
		branchRecord();
		dataset1();
		//download(JSON.parse(localStorage.getItem('CongregationData')), 'json.txt', 'text/plain');
		//location.hash = "#monthlyReport";
		return congregationData;
  	});
	
  }
		
});

var branchPub, branchAux, branchReg, summary, active;

function branchRecord(){

	pubRec = [];
	auxPio = [];
	regPio = [];
	
	branchPub = [];
	branchAux = [];
	branchReg = [];
	
	branchPub[0] = [];
	branchPub[1] = [];
	branchAux[1] = [];
	branchReg[1] = [];
	
	monthlyRecord[0].forEach(function(e){
		branchPub[0].push(e);
	});
	
	branchPub[0][0] = "Number of Reports";
	branchPub[0].pop();
	branchAux[0] = branchPub[0];
	branchReg[0] = branchPub[0];
	
	branchPub[0].forEach(function(e){
		branchPub[1].push(0);
		branchAux[1].push(0);
		branchReg[1].push(0);
	});


for(var i = 1; i < congregationData.length; i++){	

if(congregationData[i].privilege.regularPioneer == "Yes") {
			regPio.push(congregationData[i].name);
			//console.log(regPio);
		}else if(congregationData[i].privilege.regularPioneer == "Aux") {
			auxPio.push(congregationData[i].name);
			//console.log(auxPio);
		}else{
			pubRec.push(congregationData[i].name);
		}
}

	publisherReport = "";
	publisherReport += "<p><h2>Publishers</h2></p>";
	publisherReport += "<table><tr>"
monthlyRecord.forEach(function(row){
	if(regPio.includes(row[0])){
		return
	}
	if(auxPio.includes(row[0])){
		return
	}
	for(var i = 1; i < branchPub[1].length; i++){
	if(row[3] == "Hours"){
		continue
	}	
	branchPub[1][i] += +row[i]
	}
	if(row[3] > 0){branchPub[1][0] += 1}
	publisherReport += "</tr><tr>";
	row.forEach(function(col){
	 	publisherReport += "<td>" + col + "</td>";
	});
});
pastReport.forEach(function(row){
	if(row[3] == "Hours"){
		return
	}
	if(regPio.includes(row[0])){
		return
	}
	if(auxPio.includes(row[0])){
		return
	}
	for(var i = 1; i < branchPub[1].length; i++){
	if(row[3] == "Hours"){
		return
	}		
	branchPub[1][i] += +row[i];
	}
	if(row[3] > 0){branchPub[1][0] += 1}
	publisherReport += "</tr><tr>";
	row.forEach(function(col){
	 	publisherReport += "<td>" + col + "</td>";
	});
});
publisherReport += "</tr></table>";
		

	auxiliaryPioneerReport = "";
	auxiliaryPioneerReport += "<p><h2>Auxiliary Pioneers</h2></p>";
	auxiliaryPioneerReport += "<table><tr>"
monthlyRecord.forEach(function(row){
	if(regPio.includes(row[0])){
		return
	}
	if(pubRec.includes(row[0])){
		return
	}
	for(var i = 1; i < branchAux[1].length; i++){
	if(row[3] == "Hours"){
		continue
	}	

	branchAux[1][i] += +row[i]
	}
	if(row[3] > 0){branchAux[1][0] += 1}
	auxiliaryPioneerReport += "</tr><tr>";
	row.forEach(function(col){
	 	auxiliaryPioneerReport += "<td>" + col + "</td>";
	});
});
pastReport.forEach(function(row){
	if(row[3] == "Hours"){
		return
	}
	if(regPio.includes(row[0])){
		return
	}
	if(pubRec.includes(row[0])){
		return
	}
	for(var i = 1; i < branchAux[1].length; i++){
	if(row[3] == "Hours"){
		continue
	}	
	branchAux[1][i] += +row[i]
	}
	if(row[3] > 0){branchAux[1][0] += 1}
	auxiliaryPioneerReport += "</tr><tr>";
	row.forEach(function(col){
	 	auxiliaryPioneerReport += "<td>" + col + "</td>";
	});
});
auxiliaryPioneerReport += "</tr></table>";

	regularPioneerReport = "";
	regularPioneerReport += "<p><h2>Regular Pioneers</h2></p>";
	regularPioneerReport += "<table><tr>"
monthlyRecord.forEach(function(row){
	if(pubRec.includes(row[0])){
		return
	}
	if(auxPio.includes(row[0])){
		return
	}
	for(var i = 1; i < branchReg[1].length; i++){
	if(row[3] == "Hours"){
		continue
	}	
	branchReg[1][i] += +row[i]
	}
	if(row[3] > 0){branchReg[1][0] += 1}
	regularPioneerReport += "</tr><tr>";
	row.forEach(function(col){
	 	regularPioneerReport += "<td>" + col + "</td>";
	});
});
pastReport.forEach(function(row){
	if(row[3] == "Hours"){
		return
	}
	if(pubRec.includes(row[0])){
		return
	}
	if(auxPio.includes(row[0])){
		return
	}
	for(var i = 1; i < branchReg[1].length; i++){
	if(row[3] == "Hours"){
		continue
	}	
	branchReg[1][i] += +row[i]
	}
	if(row[3] > 0){branchReg[1][0] += 1}
	regularPioneerReport += "</tr><tr>";
	row.forEach(function(col){
	 	regularPioneerReport += "<td>" + col + "</td>";
	});
});
regularPioneerReport += "</tr></table>";

	summary = "";
	summary += "<p><h2>Publishers</h2></p>";
	summary += "<table><tr>"
branchPub.forEach(function(row){
	summary += "</tr><tr>";
	row.forEach(function(col){
	 	summary += "<td>" + col + "</td>";
	});
});
summary += "</tr></table>";

	summary += "<p><h2>Auxiliary Pioneers</h2></p>";
	summary += "<table><tr>"
branchAux.forEach(function(row){
	summary += "</tr><tr>";
	row.forEach(function(col){
	 	summary += "<td>" + col + "</td>";
	});
});
summary += "</tr></table>";

	summary += "<p><h2>Regular Pioneers</h2></p>";
	summary += "<table><tr>"
branchReg.forEach(function(row){
	summary += "</tr><tr>";
	row.forEach(function(col){
	 	summary += "<td>" + col + "</td>";
	});
});
summary += "</tr></table>";
var activePub = 0;
for(var i = 1; i < congregationData.length; i++){
	if(m=="January") {
	if(congregationData[i].report.serviceYear1.jan.hours !== "" || congregationData[i].report.serviceYear1.dec.hours !== "" || congregationData[i].report.serviceYear1.nov.hours !== "" || congregationData[i].report.serviceYear1.oct.hours !== "" || congregationData[i].report.serviceYear1.sept.hours !== "" || congregationData[i].report.serviceYear2.aug.hours !== ""){activePub += 1}
	}
	if(m=="February") {
	if(congregationData[i].report.serviceYear1.jan.hours !== "" || congregationData[i].report.serviceYear1.dec.hours !== "" || congregationData[i].report.serviceYear1.nov.hours !== "" || congregationData[i].report.serviceYear1.oct.hours !== "" || congregationData[i].report.serviceYear1.sept.hours !== "" || congregationData[i].report.serviceYear1.feb.hours !== ""){activePub += 1}
	}
	if(m=="March") {
	if(congregationData[i].report.serviceYear1.jan.hours !== "" || congregationData[i].report.serviceYear1.dec.hours !== "" || congregationData[i].report.serviceYear1.nov.hours !== "" || congregationData[i].report.serviceYear1.oct.hours !== "" || congregationData[i].report.serviceYear1.feb.hours !== "" || congregationData[i].report.serviceYear1.mar.hours !== ""){activePub += 1}
	}
	if(m=="April") {
	if(congregationData[i].report.serviceYear1.jan.hours !== "" || congregationData[i].report.serviceYear1.feb.hours !== "" || congregationData[i].report.serviceYear1.may.hours !== "" || congregationData[i].report.serviceYear1.apr.hours !== "" || congregationData[i].report.serviceYear1.dec.hours !== "" || congregationData[i].report.serviceYear1.jan.hours !== ""){activePub += 1}
	}
	if(m=="May") {
	if(congregationData[i].report.serviceYear1.jan.hours !== "" || congregationData[i].report.serviceYear1.feb.hours !== "" || congregationData[i].report.serviceYear1.may.hours !== "" || congregationData[i].report.serviceYear1.apr.hours !== "" || congregationData[i].report.serviceYear1.dec.hours !== "" || congregationData[i].report.serviceYear1.mar.hours !== ""){activePub += 1}
	}
	if(m=="June") {
	if(congregationData[i].report.serviceYear1.jan.hours !== "" || congregationData[i].report.serviceYear1.jun.hours !== "" || congregationData[i].report.serviceYear1.may.hours !== "" || congregationData[i].report.serviceYear1.apr.hours !== "" || congregationData[i].report.serviceYear1.mar.hours !== "" || congregationData[i].report.serviceYear1.feb.hours !== ""){activePub += 1}
	}
	if(m=="July") {
	if(congregationData[i].report.serviceYear1.jul.hours !== "" || congregationData[i].report.serviceYear1.jun.hours !== "" || congregationData[i].report.serviceYear1.may.hours !== "" || congregationData[i].report.serviceYear1.apr.hours !== "" || congregationData[i].report.serviceYear1.mar.hours !== "" || congregationData[i].report.serviceYear1.feb.hours !== ""){activePub += 1}
	}
	if(m=="August") {
	if(congregationData[i].report.serviceYear1.jul.hours !== "" || congregationData[i].report.serviceYear1.jun.hours !== "" || congregationData[i].report.serviceYear1.may.hours !== "" || congregationData[i].report.serviceYear1.apr.hours !== "" || congregationData[i].report.serviceYear1.mar.hours !== "" || congregationData[i].report.serviceYear1.aug.hours !== ""){activePub += 1}
	}
	if(m=="September") {
	if(congregationData[i].report.serviceYear2.jul.hours !== "" || congregationData[i].report.serviceYear2.jun.hours !== "" || congregationData[i].report.serviceYear2.may.hours !== "" || congregationData[i].report.serviceYear2.apr.hours !== "" || congregationData[i].report.serviceYear1.sept.hours !== "" || congregationData[i].report.serviceYear2.aug.hours !== ""){activePub += 1}
	}
	if(m=="October") {
	if(congregationData[i].report.serviceYear2.jul.hours !== "" || congregationData[i].report.serviceYear2.jun.hours !== "" || congregationData[i].report.serviceYear2.may.hours !== "" || congregationData[i].report.serviceYear1.oct.hours !== "" || congregationData[i].report.serviceYear1.sept.hours !== "" || congregationData[i].report.serviceYear2.aug.hours !== ""){activePub += 1}
	}
	if(m=="November") {
	if(congregationData[i].report.serviceYear2.jul.hours !== "" || congregationData[i].report.serviceYear2.jun.hours !== "" || congregationData[i].report.serviceYear1.nov.hours !== "" || congregationData[i].report.serviceYear1.oct.hours !== "" || congregationData[i].report.serviceYear1.sept.hours !== "" || congregationData[i].report.serviceYear2.aug.hours !== ""){activePub += 1}
	}
	if(m=="December") {
	if(congregationData[i].report.serviceYear2.jul.hours !== "" || congregationData[i].report.serviceYear1.dec.hours !== "" || congregationData[i].report.serviceYear1.nov.hours !== "" || congregationData[i].report.serviceYear1.oct.hours !== "" || congregationData[i].report.serviceYear1.sept.hours !== "" || congregationData[i].report.serviceYear2.aug.hours !== ""){activePub += 1}
	}
}
active = "";
active += "<p><h2>Active Publishers</h2></p>";
active += activePub;
active += "<p><h2>Average Weekend Attendance</h2></p>";
};

var serviceYear = "";

if(m == "September"){
	serviceYear = "<p><button style='width:200px;' id='srvYr' class='button' onclick='yrProcess()'>Update Service Year</button></p>"
}

function attDownload() {
	if (confirm('Press "OK" to Download Attendance')){
	download(JSON.stringify(Attendance), 'Attendance.csv', 'text/plain');
	localStorage.removeItem('Attendance');
	} else {
		return;
	}

}


//Function starts here
function getContent(fragmentId, callback){
 var pages = {
	 cong: "<h1>Congregation</h1>",//"<ul class='topnav'><li><a class='active' href='#monthlyReport'>Monthly Report</a></li><li><a href='#missingReport'>Missing Report</a></li><li><a href='#branch'>Branch Report</a></li></ul><h1>Cong Name</h1>",
	 fieldServiceGroups: "<h1>Field Service Groups</h1>" + "<div style='display: flex; flex-wrap: wrap; margin: 0; padding: 0; width: 100%;'>" + missingReport + "</div>",
	 contactInformation: "<h1>Contact Information</h1>",
	 settings: "<h1>Settings</h1>",
	 report: "<h1>Report</h1>",
	monthlyReport: "<h1>Monthly Report (" + m + " " + yr + ")</h1>" + serviceYear + "<div>" + reports + lateReport + "</div>",
    missingReport: "<h1>Missing Report</h1>" + "<div style='display: flex; flex-wrap: wrap; margin: 0; padding: 0; width: 100%;'>" + missingReport + "</div>",	
	branch: "<h1>Branch Report</h1>" + active + attendance.average.weekend + "<p><button style='width:200px;' id='addAtt' class='button' onclick='attProcess()'>Process Attendance</button><button style='width:110px;' id='attDownload' class='button' onclick='attDownload()'>Download</button></p>" + summary + publisherReport + auxiliaryPioneerReport + regularPioneerReport

  };
  callback(pages[fragmentId]);
};

function loadContent(){

  var contentDiv = document.getElementById("app"),
      fragmentId = location.hash.substr(1);

  getContent(fragmentId, function (content) {
    contentDiv.innerHTML = content;
  });
}

if(!location.hash) {
  location.hash = "#cong";
}

loadContent();

window.addEventListener("hashchange", loadContent);
*/