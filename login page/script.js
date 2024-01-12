var navigationVue, allPublishersVue, congregationVue, configurationVue, fieldServiceGroupsVue, monthlyReportVue, missingReportVue;
var allButtons = [{"title": "Congregation Information", "function": "congregationVue"}, {"title": "All Publishers", "function": "allPublishersVue"}, {"title": "Field Service Groups", "function": "fieldServiceGroupsVue"}, {"title": "All Contact Information", "function": "congregationVue"}, {"title": "Monthly Report", "function": "monthlyReportVue"}, {"title": "Missing Report", "function": "missingReportVue"}, {"title": "Attendance", "function": "attendanceVue"}, {"title": "Configuration", "function": "configurationVue"}]
//var CongregationData = JSON.parse(localStorage.getItem('CongregationData'));

function createWorker(script, fn) {
    var blob;
    if (script) {
        blob = new Blob([`importScripts(${script});\n\n`, 'self.onmessage = ', fn.toString()], { type: 'text/javascript' });
    } else {
        blob = new Blob(['self.onmessage = ', fn.toString()], { type: 'text/javascript' });
    }
    var url = URL.createObjectURL(blob);
    return new Worker(url);
}

var DBWorker = new Worker("indexedDB.js")

DBWorker.postMessage({ dbName: 'congRec', action: "init"});

var configured

var currentMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;


DBWorker.onmessage = async function (msg) {
    var msgData = msg.data;
    //console.log(msgData)
    switch (msgData.name) {
        case "configuration":
            {
                console.log(msgData.value)
                if (msgData.value.filter(elem=>elem.name == "Congregation").length == 0) {
                    configurationVue.display = true
                    configured = false
					configurationVue.configuration = defaultConfiguration
					attendanceVue.currentMonth = currentMonthAttendance
					attendanceVue.meetingAttendanceRecord = meetingAttendanceRecord
					
					//configurationVue.configuration = result.configuration
					navigationVue.allGroups = configurationVue.configuration.fieldServiceGroups
					//allPublishersVue.publishers = result.data
					//attendanceVue.currentMonth = result.attendance[0]
					//attendanceVue.meetingAttendanceRecord = result.attendance[1]

                    navigationVue.buttons = [{"title": "Congregation Information", "function": "congregationVue"}, {"title": "All Publishers", "function": "allPublishersVue"}, {"title": "Field Service Groups", "function": "fieldServiceGroupsVue"}, {"title": "All Contact Information", "function": "congregationVue"}, {"title": "Monthly Report", "function": "monthlyReportVue"}, {"title": "Missing Report", "function": "missingReportVue"}, {"title": "Attendance", "function": "attendanceVue"}]
                }
				if (msgData.value.filter(elem=>elem.name == "Congregation").length !== 0) {
                    congregationVue.display = true
                    configured = true
                    navigationVue.buttons = [{"title": "All Publishers", "function": "allPublishersVue"}, {"title": "Field Service Groups", "function": "fieldServiceGroupsVue"}, {"title": "All Contact Information", "function": "congregationVue"}, {"title": "Monthly Report", "function": "monthlyReportVue"}, {"title": "Missing Report", "function": "missingReportVue"}, {"title": "Attendance", "function": "attendanceVue"}, {"title": "Configuration", "function": "configurationVue"}]
                    configurationVue.configuration = msgData.value[0]
                    navigationVue.allGroups = msgData.value[0].fieldServiceGroups
                    DBWorker.postMessage({ storeName: 'data', action: "readAll"});
                    DBWorker.postMessage({ storeName: 'attendance', action: "readAll"});
                }/*
				if (msgData.value.filter(elem=>elem.name == "Late Reports").length !== 0) {
                    
                    //navigationVue.buttons = [{"title": "Congregation Information", "function": "congregationVue"}, {"title": "All Publishers", "function": "allPublishersVue"}, {"title": "Field Service Groups", "function": "fieldServiceGroupsVue"}, {"title": "All Contact Information", "function": "congregationVue"}, {"title": "Monthly Report", "function": "monthlyReportVue"}, {"title": "Missing Report", "function": "missingReportVue"}, {"title": "Attendance", "function": "attendanceVue"}]
                }*/
            }
            break;
        case "data":
            {
                allPublishersVue.publishers = msgData.value
				/*
				var publisherRecords = []
				allPublishersVue.publishers.forEach(publisher=>{
					monthlyReportVue.months.slice(0, monthlyReportVue.months.findIndex(elem=>elem.abbr == monthlyReportVue.month.abbr)).forEach(elem=>{
						if (publisher.report.currentServiceYear[`${elem.abbr}`].sharedInMinistry == null) {
							publisherRecords.push({'publisher': publisher, 'name': publisher.name, 'month': elem, 'fieldServiceGroup': publisher.fieldServiceGroup, 'contactInformation': publisher.contactInformation, 'dateOfBirth': publisher.dateOfBirth, 'report':publisher.report.currentServiceYear[`${elem.abbr}`]})
						}
					})
				})

				const currentDate = new Date();
                const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

				DBWorker.postMessage({ storeName: 'configuration', action: "save", value: [{"name": "Late Reports", "month": formattedDate, "value": publisherRecords}]});
				
				console.log(publisherRecords)*/
            }
            break;
        case "ready":
            {
                
            }
            break;
        case "attendance":
            {
                if (msgData.value.filter(elem=>elem.name == "Monthly").length !== 0 && msgData.value.filter(elem=>elem.name == "Monthly")[0].month == currentMonth) {
					console.log(msgData.value)
					attendanceVue.currentMonth = msgData.value.filter(elem=>elem.name == "Monthly")[0]
				} else {
					attendanceVue.currentMonth = currentMonthAttendance
					DBWorker.postMessage({ storeName: 'attendance', action: "save", value: [attendanceVue.currentMonth]});
				}

				if (msgData.value.filter(elem=>elem.name == "Meeting Attendance Record").length !== 0) {
					console.log(msgData.value)
					attendanceVue.meetingAttendanceRecord = msgData.value.filter(elem=>elem.name == "Meeting Attendance Record")[0]
				} else {
					attendanceVue.meetingAttendanceRecord = meetingAttendanceRecord
					DBWorker.postMessage({ storeName: 'attendance', action: "save", value: [attendanceVue.meetingAttendanceRecord]});
				}
				
            }
            break;
        case "savings":
            {
                if (monthlyReportVue.saved !== 0) {
					//console.log(msgData)
					monthlyReportVue.saved--
				}
				if (missingReportVue.saved !== 0) {
					//console.log(msgData)
					missingReportVue.saved--
				}
            }
            break;
        case "done":
            {
                // No code here
            }
            break;
    }
}

document.querySelector('#navigation').innerHTML = `<template>
	<div style="display:flex">
		<button v-for="(button, count) in buttons" :key="count" @click="openButton($event.target)">{{ button.title }}</button>
		<div v-if="display == true" style="display:flex">
			<select v-model="fieldServiceGroup" style="margin:1px">
				<option v-if="allGroups.length > 1" value="All Field Service Groups">All Field Service Groups</option>
				<option v-for="group in allGroups" :key="group" :value="group">{{ group }}</option>
			</select>
			<div class="my-searchbox-holder" style="margin: 10px; width: 250px;">
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
            buttons: [],
            allGroups: [],
            fieldServiceGroup: 'All Field Service Groups',
			searchTerms: '',
			display: false,
        },
        computed: {
            allCharacters() {/*
                return getUniqueElementsByProperty(this.clickedSectionFilter,['ID'])*/
            },
        },
        methods: {
			openButton(button) {
                //console.log(button)
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
    configurationVue.display = false
	monthlyReportVue.display = false
	missingReportVue.display = false
	attendanceVue.display = false
	if (button == "congregationVue" || button == "configurationVue") {
		navigationVue.display = false
	} else {
		navigationVue.display = true
	}
	window[`${button}`].display = true
}

document.querySelector('#congregation').innerHTML = `<template>
    <div v-if="display == true">
		<h1>{{ congregation.congregationName }}</h1>
		<h2>{{ congregation.address }}</h2>
		<!--h3>{{ congregation.email }}</h3>
		<h3>{{ publishersCount }} {{ publishersCount <= 1 ? 'Publisher' : 'Publishers' }}</h3-->
	</div>
</template>`

function processCongregation() {

    congregationVue = new Vue({
        el: document.querySelector('#congregation'),
        data: {
            //congregation: {"name": "New England Congregation", "address": "14 Hannesson Street, New England Ville.", "email": "cong574356@jwpub.org"},
            display: false,
        },
        computed: {
            publishersCount() {
                return allPublishersVue.publishers.length
            },
            congregation() {
                return configurationVue.configuration
            },
        },
        methods: {
			
        }
    })
}

document.querySelector('#configuration').innerHTML = `<template>
    <div v-if="display == true">
		<h1 contenteditable="true" class="name">{{ configuration.congregationName }}</h1>
		<h2 contenteditable="true" class="address">{{ configuration.address }}</h2>
		<h2 contenteditable="true" class="email">{{ configuration.email }}</h2>
		<h3 v-for="group in configuration.fieldServiceGroups" :key="group" contenteditable="true" class="fieldServiceGroups">{{ group }}</h3>
        <button @click="saveConfiguration($event.target)">Save</button>
        <button @click="resetConfiguration($event.target)">Reset</button>
        <button @click="addGroup($event.target)">Add Field Service Group</button>
        <button @click="removeGroup($event.target)">Remove Field Service Group</button>
        <p>
            <button @click="saveFile()">Save File</button>
            <input type="file" id="pdfFile" accept=".pdf">
        </p>
		<p>
            <div class="main">
				<button @click="publisherDetail($event.target)">New Publisher</button>
			</div>
			<div class="detail" style="display:none; border: 1px solid gray; padding:5px">
				<button @click="publisherDetail($event.target)">Save</button>
				<button @click="cancel($event.target)">Cancel</button>
				<p><label>Name: <input type="text" class="name" placeholder="Publisher Name" :value="publisher.name"></label></p>
				<p>
					<label>Date of Birth: </label>
					<input v-if="publisher.dateOfBirth == null" type="date" class="dateOfBirth">
					<select class="gender">
						<option v-for="gender in ['Select Gender', 'Male', 'Female']" :value="gender">{{ gender }}</option>
					</select>
				</p>
				<p>
					<label>Date of Baptism: </label>
					<input type="date" class="dateOfBaptism">
					
					<select class="hope">
						<option v-for="hope in hopes" :value="hope">{{ hope }}</option>
					</select>
				</p>
				<label v-for="(privilege, index) in privileges" :key="index"><input type="checkbox" :name="privilege" class="privileges" :checked=publisher.privilege.includes(privilege)>{{ privilege }}</label>
				<p>
					<label>Field Service Group: </label>
					<select class="fieldServiceGroup">
						<option value="">Select Group</option>
						<option v-for="group in allGroups" :value="group">{{ group }}</option>
					</select>
				</p>
				<label>Address: </label>
				<p contenteditable="true" class="contactAddress">{{ publisher.contactInformation.address }}</p>
				<label>Phone Number: </label>
				<p contenteditable="true" class="contactPhoneNumber">{{ publisher.contactInformation.phoneNumber }}</p>
				<label>Emergency Contact Name: </label>
				<p contenteditable="true" class="emergencyContactAddress">{{ publisher.emergencyContactInformation.address }}</p>
				<label>Emergency Contact Phone Number: </label>
				<p contenteditable="true" class="emergencyContactPhoneNumber">{{ publisher.emergencyContactInformation.phoneNumber }}</p>
				<table>
					<thead>
					<tr>
						<th>Service Year 2024</th>
						<th>Shared in Ministry</th>
						<th>Bible Studies</th>
						<th>Auxiliary Pioneer</th>
						<th>Hours (If pioneer or ﬁeld missionary)</th>
						<th>Remarks</th>
					</tr>
					</thead>
					<tbody>
					<tr v-for="(month, index) in months" :key="month.abbr" :class="month.abbr">
						<td>{{ month.fullName }}</td>
						<td><input class="sharedInMinistry" type="checkbox" :checked="publisher.report.currentServiceYear[month.abbr].sharedInMinistry !== null"></td>
						<td class="bibleStudies" contenteditable="true">{{ publisher.report.currentServiceYear[month.abbr].bibleStudies }}</td>
						<td><input class="auxiliaryPioneer" type="checkbox" :checked="publisher.report.currentServiceYear[month.abbr].auxiliaryPioneer !== null"></td>
						<td class="hours" contenteditable="true">{{ publisher.report.currentServiceYear[month.abbr].hours }}</td>
						<td class="remarks" contenteditable="true">{{ publisher.report.currentServiceYear[month.abbr].remarks }}</td>
					</tr>
					<tr>
						<td></td>
						<td></td>
						<td></td>
						<td>Total</td>
						<td>{{ publisher.report.currentServiceYear.totalHours }}</td>
						<td contenteditable="true">{{ publisher.report.currentServiceYear.totalRemarks }}</td>
					</tr>
					</tbody>
				</table>
			</div>
        </p>
		<p>
            <button @click="exportData()">Export Data</button>
            <button @click="importData()">Import Data</button>
            <input type="file" id="dataFile" accept=".txt">
        </p>
	</div>
</template>`

function processConfiguration() {

    configurationVue = new Vue({
        el: document.querySelector('#configuration'),
        data: {
            configuration: {},
            display: false,
			publisher: {},
			hopes: ['Unbaptized Publisher', 'Other Sheep', 'Anointed'],
			privileges: ['Elder', 'Ministerial Servant', 'Regular Pioneer', 'Special Pioneer', 'Field Missionary'],
            months: [{"abbr": "sept", "fullName": "September"}, {"abbr": "oct", "fullName": "October"}, {"abbr": "nov", "fullName": "November"}, {"abbr": "dec", "fullName": "December"}, {"abbr": "jan", "fullName": "January"}, {"abbr": "feb", "fullName": "February"}, {"abbr": "mar", "fullName": "March"}, {"abbr": "apr", "fullName": "April"}, {"abbr": "may", "fullName": "May"}, {"abbr": "jun", "fullName": "June"}, {"abbr": "jul", "fullName": "July"}, {"abbr": "aug", "fullName": "August"} ],
        },
        computed: {
            publishersCount() {
                return allPublishersVue.publishers.length
            },
			selectedGroup() {
                return navigationVue.fieldServiceGroup
            },
			allGroups() {
                return navigationVue.allGroups
            },
        },
        methods: {
            exportData() {
                var a = document.createElement("a");
				var file = new Blob([JSON.stringify({"configuration":configurationVue.configuration, "data":allPublishersVue.publishers, "attendance": [attendanceVue.currentMonth, attendanceVue.meetingAttendanceRecord]})], {type: 'text/plain'});
				a.href = URL.createObjectURL(file);
				
				a.download = 'congData.txt';
				a.click();
				//window.indexedDB.deleteDatabase('congRec');
            },
            importData() {
                var reader = new FileReader();

				// When the FileReader has loaded the file...
				reader.onload = function() {
					var result = JSON.parse(this.result)
					configurationVue.configuration = result.configuration
					navigationVue.allGroups = result.configuration.fieldServiceGroups
					allPublishersVue.publishers = result.data
					attendanceVue.currentMonth = result.attendance[0]
					attendanceVue.meetingAttendanceRecord = result.attendance[1]

					DBWorker.postMessage({ storeName: 'configuration', action: "save", value: [result.configuration]});
					DBWorker.postMessage({ storeName: 'data', action: "save", value: result.data});
					DBWorker.postMessage({ storeName: 'attendance', action: "save", value: result.attendance});
                	configured = true
				}
				
				// Read the file content as a single string
				reader.readAsText(document.querySelector('#dataFile').files[0]);
            },
			saveConfiguration(element) {
                /*if (configured = true) {
                    DBWorker.postMessage({ storeName: 'configuration', action: "deleteItem", value: this.configuration.name});
                }*/
                
                var allGroups = []
                element.parentNode.querySelectorAll('.fieldServiceGroups').forEach(elem=>{
                    allGroups.push(elem.innerHTML)
                })

                allGroups.sort()

                this.configuration = {"name": "Congregation", "congregationName": element.parentNode.querySelector('.name').innerHTML, "address": element.parentNode.querySelector('.address').innerHTML, "email": element.parentNode.querySelector('.email').innerHTML, "fieldServiceGroups": allGroups}
                DBWorker.postMessage({ storeName: 'configuration', action: "save", value: [this.configuration]});
                configured = true
            },
            async resetConfiguration() {
                if (confirm('Are you sure you want to Reset records?\nPress "OK" to Reset')) {
					window.indexedDB.deleteDatabase('congRec');
					location.reload()
				}
            },
            addGroup() {
                const count = configurationVue.configuration.fieldServiceGroups.filter(elem=>elem.startsWith("Group ")).map(elem=>Number(elem.split(' ')[1])).sort().slice(-1)[0]
                this.configuration.fieldServiceGroups.push("Group " + (count ? count : 0 + 1))
            },
            removeGroup() {
                this.configuration.fieldServiceGroups.pop()
            },
			cancel(item) {
				item.parentNode.querySelector('.name').value = ''
				item.parentNode.querySelector('.dateOfBirth').value = ''
				item.parentNode.querySelector('.dateOfBaptism').value = ''
				item.parentNode.querySelector('.gender').value = 'Select Gender'
                item.parentNode.querySelector('.hope').value = 'Unbaptized Publisher'
                item.parentNode.querySelector('.fieldServiceGroup').value = ''
				item.parentNode.parentNode.querySelectorAll('.privileges').forEach(elem=>{
					elem.checked = false
				})
                item.parentNode.querySelector('.contactAddress').innerHTML = ''
                item.parentNode.querySelector('.contactPhoneNumber').innerHTML = ''
                item.parentNode.querySelector('.emergencyContactAddress').innerHTML = ''
                item.parentNode.querySelector('.emergencyContactPhoneNumber').innerHTML = ''
				this.months.forEach(elem=>{
					const currentItem = item.parentNode.querySelector(`.${elem.abbr}`)
					currentItem.querySelector('.hours').innerHTML = ''
					currentItem.querySelector('.bibleStudies').innerHTML = ''
					currentItem.querySelector('.remarks').innerHTML = ''
					currentItem.querySelector('.sharedInMinistry').checked = false
					currentItem.querySelector('.auxiliaryPioneer').checked = false
				})
				item.parentNode.parentNode.querySelector('.detail').style.display = 'none'
                item.parentNode.parentNode.querySelector('.main').style.display = ''
			},
			publisherDetail(item) {
				var publisher = JSON.parse(JSON.stringify(newPublisherRecord))
                if (item.parentNode.className == 'main') {
                    item.parentNode.parentNode.querySelector('.main').style.display = 'none'
                    item.parentNode.parentNode.querySelector('.detail').style.display = ''
                } else {
                    if (item.parentNode.querySelector('.name').value) {
                        publisher.name = item.parentNode.querySelector('.name').value
                    } else {
						alert('Please enter Publisher Name')
						return
					}
					if (item.parentNode.querySelector('.dateOfBirth').value) {
                        publisher.dateOfBirth = item.parentNode.querySelector('.dateOfBirth').value
                    }
                    if (item.parentNode.querySelector('.dateOfBaptism')) {
                        publisher.dateOfBaptism = item.parentNode.querySelector('.dateOfBaptism').value
                    }
                    publisher.gender = item.parentNode.querySelector('.gender').value
                    publisher.hope = item.parentNode.querySelector('.hope').value
                    publisher.fieldServiceGroup = item.parentNode.querySelector('.fieldServiceGroup').value
                    
                    var allPrivileges = []

                    item.parentNode.parentNode.querySelectorAll('.privileges').forEach(elem=>{
                        if (elem.checked) {
                            allPrivileges.push(elem.name)
                        }
                    })

                    allPrivileges.sort()

                    publisher.privilege = allPrivileges

                    publisher.contactInformation.address = item.parentNode.querySelector('.contactAddress').innerHTML
                    publisher.contactInformation.phoneNumber = item.parentNode.querySelector('.contactPhoneNumber').innerHTML
                    publisher.emergencyContactInformation.name = item.parentNode.querySelector('.emergencyContactAddress').innerHTML
                    publisher.emergencyContactInformation.phoneNumber = item.parentNode.querySelector('.emergencyContactPhoneNumber').innerHTML
                    this.months.forEach(elem=>{
                        const currentItem = item.parentNode.querySelector(`.${elem.abbr}`)
                        if (currentItem.querySelector('.hours').innerHTML !== '') {
                            publisher.report.currentServiceYear[elem.abbr].hours = Number(currentItem.querySelector('.hours').innerHTML)
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].hours = null
                        }
                        if (currentItem.querySelector('.bibleStudies').innerHTML !== '') {
                            publisher.report.currentServiceYear[elem.abbr].bibleStudies = Number(currentItem.querySelector('.bibleStudies').innerHTML)
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].bibleStudies = null
                        }
                        if (currentItem.querySelector('.remarks').innerHTML !== '') {
                            publisher.report.currentServiceYear[elem.abbr].remarks = Number(currentItem.querySelector('.remarks').innerHTML)
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].remarks = null
                        }
                        if (currentItem.querySelector('.sharedInMinistry').checked) {
                            publisher.report.currentServiceYear[elem.abbr].sharedInMinistry = currentItem.querySelector('.sharedInMinistry').checked
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].sharedInMinistry = null
                        }
                        if (currentItem.querySelector('.auxiliaryPioneer').checked) {
                            publisher.report.currentServiceYear[elem.abbr].auxiliaryPioneer = currentItem.querySelector('.auxiliaryPioneer').checked
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].auxiliaryPioneer = null
                        }
                        //console.log(currentItem.querySelector('.sharedInMinistry').checked)
                        //console.log(currentItem.querySelector('.hours'))
                    })

					allPublishersVue.publishers.push(publisher)

                    console.log(publisher)
                    
                    DBWorker.postMessage({ storeName: 'data', action: "save", value: [publisher]});
					this.cancel(item)
                }
			},
			saveFile() {
				DBWorker.postMessage({ storeName: 'files', action: "save", value: [document.getElementById('pdfFile').files[0]]});
			}
        }
    })
}

document.querySelector('#allPublishers').innerHTML = `<template>
	<div v-if="display == true">
		<section>
			<div v-for="(publisher, count) in publishers" :key="count" v-if="(publisher.fieldServiceGroup == selectedGroup || selectedGroup == 'All Field Service Groups') && (publisher.name.toLowerCase().includes(searchTerms) || publisher.contactInformation.address.toLowerCase().includes(searchTerms) || publisher.contactInformation.phoneNumber.toLowerCase().includes(searchTerms))">
                <div class="main" style="cursor:pointer">
                    <div @click="publisherDetail(publisher, $event.target)">{{ publisher.name }}</div>
                </div>
                <div class="detail" style="display:none; border: 1px solid gray; padding:5px">
					<i @click="publisherDetail(publisher, $event.target)" class="fas fa-arrow-left"></i>
					<i @click="removePublisher(count, publisher.name, $event.target)" class="fas fa-trash-alt"></i>
                    <h2 contenteditable="true" class="name">{{ publisher.name }}</h2>
                    <p>
                        <label>Date of Birth: </label>
                        <input v-if="publisher.dateOfBirth == null" type="date" class="dateOfBirth">
                        <input v-if="publisher.dateOfBirth !== null" type="date" class="dateOfBirth" :value="cleanDate(publisher.dateOfBirth)">
                        <select class="gender" :v-model="publisher.gender">
                            <option v-if="publisher.gender !== 'Male' && publisher.gender !== 'Female'" value="">Select Gender</option>
                            <option v-if="publisher.gender == 'Male' || publisher.gender == 'Female'" :value="publisher.gender">{{ publisher.gender }}</option>
                            <option v-for="gender in ['Male', 'Female'].filter(elem=>elem !== publisher.gender)" :value="gender">{{ gender }}</option>
                        </select>
                    </p>
                    <p>
                        <label>Date of Baptism: </label>
                        <input type="date" class="dateOfBaptism" :value="cleanDate(publisher.dateOfBaptism)">
                        
                        <select class="hope" :v-model="publisher.hope">
                            <option :value="publisher.hope">{{ publisher.hope }}</option>
                            <option v-for="hope in hopes.filter(elem=>elem !== publisher.hope)" :value="hope">{{ hope }}</option>
                        </select>
                    </p>
                    <label v-for="(privilege, index) in privileges" :key="index"><input type="checkbox" :name="privilege" class="privileges" :checked=publisher.privilege.includes(privilege)>{{ privilege }}</label>
                    <p>
                        <label>Field Service Group: </label>
                        <select class="fieldServiceGroup" :v-model="publisher.fieldServiceGroup">
							<option v-if="!allGroups.includes(publisher.fieldServiceGroup)" value="">Select Group</option>
                            <option v-if="allGroups.includes(publisher.fieldServiceGroup)" :value="publisher.fieldServiceGroup">{{ publisher.fieldServiceGroup }}</option>
                            <option v-for="group in allGroups.filter(elem=>elem !== publisher.fieldServiceGroup)" :value="group">{{ group }}</option>
                        </select>
                    </p>
                    <label>Address: </label>
                    <p contenteditable="true" class="contactAddress">{{ publisher.contactInformation.address }}</p>
                    <label>Phone Number: </label>
                    <p contenteditable="true" class="contactPhoneNumber">{{ publisher.contactInformation.phoneNumber }}</p>
                    <label>Emergency Contact Name: </label>
                    <p contenteditable="true" class="emergencyContactAddress">{{ publisher.emergencyContactInformation.address }}</p>
                    <label>Emergency Contact Phone Number: </label>
                    <p contenteditable="true" class="emergencyContactPhoneNumber">{{ publisher.emergencyContactInformation.phoneNumber }}</p>
                    <table>
                        <thead>
                        <tr>
                            <th>Service Year 2024</th>
                            <th>Shared in Ministry</th>
                            <th>Bible Studies</th>
                            <th>Auxiliary Pioneer</th>
                            <th>Hours (If pioneer or ﬁeld missionary)</th>
                            <th>Remarks</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(month, index) in months" :key="month.abbr" :class="month.abbr">
                            <td>{{ month.fullName }}</td>
                            <td><input class="sharedInMinistry" type="checkbox" :checked="publisher.report.currentServiceYear[month.abbr].sharedInMinistry !== null"></td>
                            <td class="bibleStudies" contenteditable="true">{{ publisher.report.currentServiceYear[month.abbr].bibleStudies }}</td>
                            <td><input class="auxiliaryPioneer" type="checkbox" :checked="publisher.report.currentServiceYear[month.abbr].auxiliaryPioneer !== null"></td>
                            <td class="hours" contenteditable="true">{{ publisher.report.currentServiceYear[month.abbr].hours }}</td>
                            <td class="remarks" contenteditable="true">{{ publisher.report.currentServiceYear[month.abbr].remarks }}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Total</td>
                            <td>{{ publisher.report.currentServiceYear.totalHours }}</td>
                            <td contenteditable="true">{{ publisher.report.currentServiceYear.totalRemarks }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
		</section>
    </div>
</template>`

function processAllPublishers() {

    allPublishersVue = new Vue({
        el: document.querySelector('#allPublishers'),
        data: {
            publishers: [],
            display: false,
            hopes: ['Anointed', 'Other Sheep', 'Unbaptized Publisher'],
            privileges: ['Elder', 'Ministerial Servant', 'Regular Pioneer', 'Special Pioneer', 'Field Missionary'],
            months: [{"abbr": "sept", "fullName": "September"}, {"abbr": "oct", "fullName": "October"}, {"abbr": "nov", "fullName": "November"}, {"abbr": "dec", "fullName": "December"}, {"abbr": "jan", "fullName": "January"}, {"abbr": "feb", "fullName": "February"}, {"abbr": "mar", "fullName": "March"}, {"abbr": "apr", "fullName": "April"}, {"abbr": "may", "fullName": "May"}, {"abbr": "jun", "fullName": "June"}, {"abbr": "jul", "fullName": "July"}, {"abbr": "aug", "fullName": "August"} ],
        },
        computed: {
            allCharacters() {/*
                return getUniqueElementsByProperty(this.clickedSectionFilter,['ID'])*/
            },
            searchTerms() {
                return navigationVue.searchTerms
            },
			selectedGroup() {
                return navigationVue.fieldServiceGroup
            },
			allGroups() {
                return navigationVue.allGroups
            },
        },
        methods: {
			publisherDetail(publisher, item) {
                if (item.parentNode.className == 'main') {
                    item.parentNode.parentNode.querySelector('.main').style.display = 'none'
                    item.parentNode.parentNode.querySelector('.detail').style.display = ''
                } else {
					if (item.parentNode.querySelector('.name').innerHTML.trim() == '' || item.parentNode.querySelector('.name').innerHTML.trim().replaceAll('&nbsp;','').replaceAll('nbsp;','').replaceAll('&amp;','').replaceAll(' ','') == '') {
						alert("Please enter Publisher Name")
						return
					}
					if (publisher.name !== item.parentNode.querySelector('.name').innerHTML) {
						DBWorker.postMessage({ storeName: 'data', action: "deleteItem", value: publisher.name});
					}
                    publisher.name = item.parentNode.querySelector('.name').innerHTML
                    if (item.parentNode.querySelector('.dateOfBirth').value) {
                        publisher.dateOfBirth = item.parentNode.querySelector('.dateOfBirth').value
                    }
                    if (item.parentNode.querySelector('.dateOfBaptism')) {
                        publisher.dateOfBaptism = item.parentNode.querySelector('.dateOfBaptism').value
                    }
                    publisher.gender = item.parentNode.querySelector('.gender').value
                    publisher.hope = item.parentNode.querySelector('.hope').value
                    publisher.fieldServiceGroup = item.parentNode.querySelector('.fieldServiceGroup').value
                    
                    var allPrivileges = []

                    item.parentNode.parentNode.querySelectorAll('.privileges').forEach(elem=>{
                        if (elem.checked) {
                            allPrivileges.push(elem.name)
                        }
                    })

                    allPrivileges.sort()

                    publisher.privilege = allPrivileges

                    publisher.contactInformation.address = item.parentNode.querySelector('.contactAddress').innerHTML
                    publisher.contactInformation.phoneNumber = item.parentNode.querySelector('.contactPhoneNumber').innerHTML
                    publisher.emergencyContactInformation.name = item.parentNode.querySelector('.emergencyContactAddress').innerHTML
                    publisher.emergencyContactInformation.phoneNumber = item.parentNode.querySelector('.emergencyContactPhoneNumber').innerHTML
                    this.months.forEach(elem=>{
                        const currentItem = item.parentNode.querySelector(`.${elem.abbr}`)
                        if (currentItem.querySelector('.hours').innerHTML !== '') {
                            publisher.report.currentServiceYear[elem.abbr].hours = Number(currentItem.querySelector('.hours').innerHTML)
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].hours = null
                        }
                        if (currentItem.querySelector('.bibleStudies').innerHTML !== '') {
                            publisher.report.currentServiceYear[elem.abbr].bibleStudies = Number(currentItem.querySelector('.bibleStudies').innerHTML)
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].bibleStudies = null
                        }
                        if (currentItem.querySelector('.remarks').innerHTML !== '') {
                            publisher.report.currentServiceYear[elem.abbr].remarks = Number(currentItem.querySelector('.remarks').innerHTML)
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].remarks = null
                        }
                        if (currentItem.querySelector('.sharedInMinistry').checked) {
                            publisher.report.currentServiceYear[elem.abbr].sharedInMinistry = currentItem.querySelector('.sharedInMinistry').checked
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].sharedInMinistry = null
                        }
                        if (currentItem.querySelector('.auxiliaryPioneer').checked) {
                            publisher.report.currentServiceYear[elem.abbr].auxiliaryPioneer = currentItem.querySelector('.auxiliaryPioneer').checked
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].auxiliaryPioneer = null
                        }
                        //console.log(currentItem.querySelector('.sharedInMinistry').checked)
                        //console.log(currentItem.querySelector('.hours'))
                    })

                    //console.log(publisher)
                    
                    item.parentNode.parentNode.querySelector('.detail').style.display = 'none'
                    item.parentNode.parentNode.querySelector('.main').style.display = ''
                    DBWorker.postMessage({ storeName: 'data', action: "save", value: [publisher]});
                }
			},          
			cleanDate(date) {
                const currentDate = new Date(date);

                const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

                return formattedDate
            },
            removePublisher(count, name, item) {
                if (confirm('Are you sure you want to delete "' + name + '" records?\nPress "OK" to Delete')) {
					item.parentNode.parentNode.querySelector('.detail').style.display = 'none'
					item.parentNode.parentNode.querySelector('.main').style.display = ''
					this.publishers.splice(count, 1)
					DBWorker.postMessage({ storeName: 'data', action: "deleteItem", value: name});
				}
            },
            sumHours(publisher) {
                var totalHours = 0
                this.months.forEach(elem=>{
                    const value = publisher.report.currentServiceYear[elem.abbr].hours
                    if (value !== null) {
                        totalHours = totalHours + value
                    }
                })
                return totalHours
            }
        }
    })
}

async function shortWait(){
    await new Promise(a=>setTimeout(a,50))
}

document.querySelector('#fieldServiceGroups').innerHTML = `<template>
	<div v-if="display == true" style="display:flex">
		<div style="display:flex">
			<div style="padding:5px" v-for="(group) in allGroups" :key="group" v-if="(selectedGroup == group || selectedGroup == 'All Field Service Groups') && (groupPublishers(group).filter(elem=>elem.name.toLowerCase().includes(searchTerms) || elem.contactInformation.address.toLowerCase().includes(searchTerms) || elem.contactInformation.phoneNumber.toLowerCase().includes(searchTerms)).length !== 0)">
				<table>
					<thead>
						<tr>
							<th>S/No.</th>
							<th>{{ group }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(publisher, count) in groupPublishers(group)" :key="publisher + '|' + count" style="cursor:pointer" v-if="publisher.name.toLowerCase().includes(searchTerms) || publisher.contactInformation.address.toLowerCase().includes(searchTerms) || publisher.contactInformation.phoneNumber.toLowerCase().includes(searchTerms)">
							<td>{{ count + 1 }}</td>
							<td>{{ publisher.name }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<!--div>
			<div v-for="(group) in allGroups" :key="group" v-if="(selectedGroup == group || selectedGroup == 'All Field Service Groups') && (groupPublishers(group).filter(elem=>elem.name.toLowerCase().includes(searchTerms) || elem.contactInformation.address.toLowerCase().includes(searchTerms) || elem.contactInformation.phoneNumber.toLowerCase().includes(searchTerms)).length !== 0)" class="grid-item">
				<h2 v-if="groupPublishers(group).filter(elem=>elem.name.toLowerCase().includes(searchTerms) || elem.contactInformation.address.toLowerCase().includes(searchTerms) || elem.contactInformation.phoneNumber.toLowerCase().includes(searchTerms)).length !== 0" class="main card-title" style="cursor:pointer">{{ group }}</h2>
				<div v-for="(publisher, count) in groupPublishers(group)" :key="publisher + '|' + count" style="cursor:pointer" v-if="publisher.name.toLowerCase().includes(searchTerms) || publisher.contactInformation.address.toLowerCase().includes(searchTerms) || publisher.contactInformation.phoneNumber.toLowerCase().includes(searchTerms)" @click="publisherDetail(publisher)">{{ publisher.name }}</div>
			</div>
		</div-->
		<div v-if="selectedPublisher.name">
            <p><input type="text" :value="selectedPublisher.name"></p>
            <p>Date of Birth: <input type="text" :value="selectedPublisher.dateOfBirth">
                <span><input type="checkbox">Male<span><input type="checkbox">Female</span>
            </p>
            <p>Date of Baptism: <input type="text" :value="selectedPublisher.dateOfBaptism">
                <span><input type="checkbox">Other Sheep<span><input type="checkbox">Anointed</span>
            </p>
            <p>
                <span><input type="checkbox">Elder<span><input type="checkbox">Ministerial Servant<span><input type="checkbox">Regular Pioneer<span><input type="checkbox">Special Pioneer<span><input type="checkbox">Field Missionary</span>
            </p>
            <div>Contact Information</div>
            <div>Ministry</div>
			<iframe v-if="pdfFile !== ''" :src="pdfFile" width="800" height="700" style="border: none;"></iframe>
		</div>
		
    </div>
</template>`

function processFieldServiceGroups() {

    fieldServiceGroupsVue = new Vue({
        el: document.querySelector('#fieldServiceGroups'),
        data: {
            publishers: [],
            display: false,
            pdfFile: "",
			selectedPublisher: {},
        },
        computed: {
            searchTerms() {
                return navigationVue.searchTerms
            },
			allGroups() {
                return navigationVue.allGroups
            },
			selectedGroup() {
                return navigationVue.fieldServiceGroup
            },
        },
        methods: {
			groupPublishers(group) {
                return allPublishersVue.publishers.filter(elem=>elem.fieldServiceGroup == group)
            },
			publisherDetail(publisher) {
				this.selectedPublisher = publisher
                //fillPublisherRecord(publisher)
			},
            updateRecord(publisher) {
				updatePublisherRecord(publisher)
			}
        }
    })
}


document.querySelector('#monthlyReport').innerHTML = `<template>
	<div v-if="display == true">
		<h1>Monthly Report</h1>
		<section style="padding:10px; margin:5px; border: 1px solid gray">
		<h2>{{ month.fullName }} {{ year }} <span v-if="saved !== 0">[Saving record. Please wait . . .]</span></h2>
			<div>
                <table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Shared in Ministry</th>
							<th>Bible Studies</th>
							<th>Auxiliary Pioneer</th>
							<th>Hours (If pioneer or ﬁeld missionary)</th>
							<th>Remarks</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(publisher, count) in publishers" :key="count" v-if="(publisher.fieldServiceGroup == selectedGroup || selectedGroup == 'All Field Service Groups') && (publisher.name.toLowerCase().includes(searchTerms) || publisher.contactInformation.address.toLowerCase().includes(searchTerms) || publisher.contactInformation.phoneNumber.toLowerCase().includes(searchTerms))">
							<td>{{ publisher.name }}</td>
							<td><input class="sharedInMinistry" type="checkbox" :checked = "publisher.report.currentServiceYear[month.abbr].sharedInMinistry !== null" @change="handleCheckboxChange(publisher.report.currentServiceYear[month.abbr], $event.target, publisher)"></td>
							<td><input class="bibleStudies" type="number" min="0" max="999" style="width: 40px;" :value="publisher.report.currentServiceYear[month.abbr].bibleStudies" @change="handleInputChange(publisher.report.currentServiceYear[month.abbr], $event.target, publisher)"></td>
							<td><input class="auxiliaryPioneer" type="checkbox" :checked = "publisher.report.currentServiceYear[month.abbr].auxiliaryPioneer !== null" @change="handleCheckboxChange(publisher.report.currentServiceYear[month.abbr], $event.target, publisher)"></td>
							<td><input class="hours" type="number" min="0" max="999" style="width: 40px;" :value="publisher.report.currentServiceYear[month.abbr].hours" @change="handleInputChange(publisher.report.currentServiceYear[month.abbr], $event.target, publisher)"></td>
							<td><input class="remarks" type="text" style="width: 200px" :value="publisher.report.currentServiceYear[month.abbr].remarks" @change="handleInputChange(publisher.report.currentServiceYear[month.abbr], $event.target, publisher)"></td>
						</tr>
					</tbody>
				</table>
            </div>
		</section>
		<section style="padding:10px; margin:5px; border: 1px solid gray">
		<h2>Late Reports</span></h2>
			<div>
                <table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Month</th>
							<th>Shared in Ministry</th>
							<th>Bible Studies</th>
							<th>Auxiliary Pioneer</th>
							<th>Hours (If pioneer or ﬁeld missionary)</th>
							<th>Remarks</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(publisher, count) in lateReports" :key="count" v-if="(publisher.fieldServiceGroup == selectedGroup || selectedGroup == 'All Field Service Groups') && (publisher.name.toLowerCase().includes(searchTerms) || publisher.contactInformation.address.toLowerCase().includes(searchTerms) || publisher.contactInformation.phoneNumber.toLowerCase().includes(searchTerms))">
							<td>{{ publisher.name }}</td>
							<td>{{ publisher.month.fullName }}</td>
							<td><input class="sharedInMinistry" type="checkbox" :checked = "publisher.report.sharedInMinistry !== null" @change="handleCheckboxChange2($event.target, publisher.publisher, publisher.month)"></td>
							<td><input class="bibleStudies" type="number" min="0" max="999" style="width: 40px;" :value="publisher.report.bibleStudies" @change="handleInputChange2($event.target, publisher.publisher, publisher.month)"></td>
							<td><input class="auxiliaryPioneer" type="checkbox" :checked = "publisher.report.auxiliaryPioneer !== null" @change="handleCheckboxChange2($event.target, publisher.publisher, publisher.month)"></td>
							<td><input class="hours" type="number" min="0" max="999" style="width: 40px;" :value="publisher.report.hours" @change="handleInputChange2($event.target, publisher.publisher, publisher.month)"></td>
							<td><input class="remarks" type="text" style="width: 200px" :value="publisher.report.remarks" @change="handleInputChange2($event.target, publisher.publisher, publisher.month)"></td>
						</tr>
					</tbody>
				</table>
            </div>
		</section>
    </div>
</template>`

function processMonthlyReport() {

    monthlyReportVue = new Vue({
        el: document.querySelector('#monthlyReport'),
        data: {
            saved: 0,
            display: false,
            hopes: ['Anointed', 'Other Sheep', 'Unbaptized Publisher'],
            privileges: ['Elder', 'Ministerial Servant', 'Regular Pioneer', 'Special Pioneer', 'Field Missionary'],
            months: [{"abbr": "sept", "fullName": "September"}, {"abbr": "oct", "fullName": "October"}, {"abbr": "nov", "fullName": "November"}, {"abbr": "dec", "fullName": "December"}, {"abbr": "jan", "fullName": "January"}, {"abbr": "feb", "fullName": "February"}, {"abbr": "mar", "fullName": "March"}, {"abbr": "apr", "fullName": "April"}, {"abbr": "may", "fullName": "May"}, {"abbr": "jun", "fullName": "June"}, {"abbr": "jul", "fullName": "July"}, {"abbr": "aug", "fullName": "August"} ],
        },
        computed: {
            allCharacters() {/*
                return getUniqueElementsByProperty(this.clickedSectionFilter,['ID'])*/
            },
            publishers() {
                return allPublishersVue.publishers
            },
			lateReports() {
				var publisherRecords = []
				allPublishersVue.publishers.forEach(publisher=>{
					monthlyReportVue.months.slice(0, monthlyReportVue.months.findIndex(elem=>elem.abbr == monthlyReportVue.month.abbr)).forEach(elem=>{
						if (publisher.report.currentServiceYear[`${elem.abbr}`].created == null || publisher.report.currentServiceYear[`${elem.abbr}`].created.split('-').slice(0, 2).join('-') == this.cleanDate(new Date()).split('-').slice(0, 2).join('-')) {
							publisherRecords.push({'publisher': publisher, 'name': publisher.name, 'month': elem, 'fieldServiceGroup': publisher.fieldServiceGroup, 'contactInformation': publisher.contactInformation, 'dateOfBirth': publisher.dateOfBirth, 'report':publisher.report.currentServiceYear[`${elem.abbr}`]})
						}
					})
				})
				
				return publisherRecords
                //return allPublishersVue.publishers
            },
            searchTerms() {
                return navigationVue.searchTerms
            },
			selectedGroup() {
                return navigationVue.fieldServiceGroup
            },
			allGroups() {
                return navigationVue.allGroups
            },
			month() {
				return monthlyReportVue.months.slice(3).concat(monthlyReportVue.months.slice(0,3))[new Date().getMonth()]
                ///return this.months[0].abbr
            },
			year() {
				var currentYear;
				if (new Date().getMonth() == 0) {
					currentYear = new Date().getFullYear() - 1
				} else {
					currentYear = new Date().getFullYear()
				}
				return currentYear
            },
        },
        methods: {
			publisherDetail(publisher, item) {
                if (item.parentNode.className == 'main') {
                    item.parentNode.parentNode.querySelector('.main').style.display = 'none'
                    item.parentNode.parentNode.querySelector('.detail').style.display = ''
                } else {
                    publisher.name = item.parentNode.querySelector('.name').innerHTML
                    if (item.parentNode.querySelector('.dateOfBirth').value) {
                        publisher.dateOfBirth = item.parentNode.querySelector('.dateOfBirth').value
                    }
                    if (item.parentNode.querySelector('.dateOfBaptism')) {
                        publisher.dateOfBaptism = item.parentNode.querySelector('.dateOfBaptism').value
                    }
                    publisher.gender = item.parentNode.querySelector('.gender').value
                    publisher.hope = item.parentNode.querySelector('.hope').value
                    publisher.fieldServiceGroup = item.parentNode.querySelector('.fieldServiceGroup').value
                    
                    var allPrivileges = []

                    item.parentNode.parentNode.querySelectorAll('.privileges').forEach(elem=>{
                        if (elem.checked) {
                            allPrivileges.push(elem.name)
                        }
                    })

                    allPrivileges.sort()

                    publisher.privilege = allPrivileges

                    publisher.contactInformation.address = item.parentNode.querySelector('.contactAddress').innerHTML
                    publisher.contactInformation.phoneNumber = item.parentNode.querySelector('.contactPhoneNumber').innerHTML
                    publisher.emergencyContactInformation.name = item.parentNode.querySelector('.emergencyContactAddress').innerHTML
                    publisher.emergencyContactInformation.phoneNumber = item.parentNode.querySelector('.emergencyContactPhoneNumber').innerHTML
                    this.months.forEach(elem=>{
                        const currentItem = item.parentNode.querySelector(`.${elem.abbr}`)
                        if (currentItem.querySelector('.hours').innerHTML !== '') {
                            publisher.report.currentServiceYear[elem.abbr].hours = Number(currentItem.querySelector('.hours').innerHTML)
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].hours = null
                        }
                        if (currentItem.querySelector('.bibleStudies').innerHTML !== '') {
                            publisher.report.currentServiceYear[elem.abbr].bibleStudies = Number(currentItem.querySelector('.bibleStudies').innerHTML)
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].bibleStudies = null
                        }
                        if (currentItem.querySelector('.remarks').innerHTML !== '') {
                            publisher.report.currentServiceYear[elem.abbr].remarks = Number(currentItem.querySelector('.remarks').innerHTML)
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].remarks = null
                        }
                        if (currentItem.querySelector('.sharedInMinistry').checked) {
                            publisher.report.currentServiceYear[elem.abbr].sharedInMinistry = currentItem.querySelector('.sharedInMinistry').checked
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].sharedInMinistry = null
                        }
                        if (currentItem.querySelector('.auxiliaryPioneer').checked) {
                            publisher.report.currentServiceYear[elem.abbr].auxiliaryPioneer = currentItem.querySelector('.auxiliaryPioneer').checked
                        } else {
                            publisher.report.currentServiceYear[elem.abbr].auxiliaryPioneer = null
                        }
                        //console.log(currentItem.querySelector('.sharedInMinistry').checked)
                        //console.log(currentItem.querySelector('.hours'))
                    })

                    //console.log(publisher)
                    
                    item.parentNode.parentNode.querySelector('.detail').style.display = 'none'
                    item.parentNode.parentNode.querySelector('.main').style.display = ''
                    DBWorker.postMessage({ storeName: 'data', action: "save", value: [publisher]});
                }
			},          
			cleanDate(date) {
                const currentDate = new Date(date);

                const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

                return formattedDate
            },
            removePublisher(count, name, item) {
                if (confirm('Are you sure you want to delete "' + name + '" records?\nPress "OK" to Delete')) {
					item.parentNode.parentNode.querySelector('.detail').style.display = 'none'
					item.parentNode.parentNode.querySelector('.main').style.display = ''
					this.publishers.splice(count, 1)
					DBWorker.postMessage({ storeName: 'data', action: "deleteItem", value: name});
				}
            },
			handleCheckboxChange(record, event, publisher) {
				this.saved++
				if (!record.created) {
					record.created = this.cleanDate(new Date())
					record.modified = this.cleanDate(new Date())
				} else {
					record.modified = this.cleanDate(new Date())
				}
				if (event.checked) {
					record[`${event.className}`] = true
				} else {
					record[`${event.className}`] = null
				}
				DBWorker.postMessage({ storeName: 'data', action: "save", value: [publisher]});
				//console.log(publisher, event, event.checked, publisher[`${event.className}`])
			},
			handleInputChange(record, event, publisher) {
				this.saved++
				if (!record.created) {
					record.created = this.cleanDate(new Date())
					record.modified = this.cleanDate(new Date())
				} else {
					record.modified = this.cleanDate(new Date())
				}
				//console.log(event.value)
				if (event.value !== '') {
					//event.innerHTML = ''
					if (event.className !== 'remarks') {
						event.value == '0' ? record[`${event.className}`] = null : record[`${event.className}`] = Number(event.value)
					} else {
						record[`${event.className}`] = event.value
					}
				} else {
					record[`${event.className}`] = null
				}
				//console.log(record, publisher)
				DBWorker.postMessage({ storeName: 'data', action: "save", value: [publisher]});
				//console.log(publisher, event, event.checked, publisher[`${event.className}`])
			},
			handleCheckboxChange2(event, publisher, month) {
				this.saved++
				if (!publisher.report.currentServiceYear[`${month.abbr}`].created) {
					publisher.report.currentServiceYear[`${month.abbr}`].created = this.cleanDate(new Date())
					publisher.report.currentServiceYear[`${month.abbr}`].modified = this.cleanDate(new Date())
				} else {
					publisher.report.currentServiceYear[`${month.abbr}`].modified = this.cleanDate(new Date())
				}
				if (event.checked) {
					if (!publisher.report.currentServiceYear[`${month.abbr}`].created) {
						publisher.report.currentServiceYear[`${month.abbr}`].created = this.cleanDate(new Date())
						publisher.report.currentServiceYear[`${month.abbr}`].modified = this.cleanDate(new Date())
					} else {
						publisher.report.currentServiceYear[`${month.abbr}`].modified = this.cleanDate(new Date())
					}
					publisher.report.currentServiceYear[`${month.abbr}`][`${event.className}`] = true
				} else {
					publisher.report.currentServiceYear[`${month.abbr}`][`${event.className}`] = null
				}
				DBWorker.postMessage({ storeName: 'data', action: "save", value: [publisher]});
				//console.log(publisher, event, event.checked, publisher[`${event.className}`])
			},
			handleInputChange2(event, publisher, month) {
				this.saved++
				if (!publisher.report.currentServiceYear[`${month.abbr}`].created) {
					publisher.report.currentServiceYear[`${month.abbr}`].created = this.cleanDate(new Date())
					publisher.report.currentServiceYear[`${month.abbr}`].modified = this.cleanDate(new Date())
				} else {
					publisher.report.currentServiceYear[`${month.abbr}`].modified = this.cleanDate(new Date())
				}
				if (event.value !== '') {
					//event.innerHTML = ''
					if (event.className !== 'remarks') {
						event.value == '0' ? publisher.report.currentServiceYear[`${month.abbr}`][`${event.className}`] = null : publisher.report.currentServiceYear[`${month.abbr}`][`${event.className}`] = Number(event.value)
					} else {
						publisher.report.currentServiceYear[`${month.abbr}`][`${event.className}`] = event.value
					}
				} else {
					publisher.report.currentServiceYear[`${month.abbr}`][`${event.className}`] = null
				}
				//console.log(record, publisher)
				DBWorker.postMessage({ storeName: 'data', action: "save", value: [publisher]});
				//console.log(publisher, event, event.checked, publisher[`${event.className}`])
			},
            sumHours(publisher) {
                var totalHours = 0
                this.months.forEach(elem=>{
                    const value = publisher.report.currentServiceYear[elem.abbr].hours
                    if (value !== null) {
                        totalHours = totalHours + value
                    }
                })
                return totalHours
            }
        }
    })
}

document.querySelector('#missingReport').innerHTML = `<template>
	<div v-if="display == true" style="display:block">
		<h1>Missing Reports</h1>
		<div style="display:flex; flex-wrap:wrap">
			<div style="padding:10px; margin:5px; border: 1px solid gray" v-for="(group) in allGroups" :key="group" v-if="(selectedGroup == group || selectedGroup == 'All Field Service Groups') && (groupPublishers(group).filter(elem=>elem.name.toLowerCase().includes(searchTerms) && missingRecord(elem).length !== 0).length !== 0)">
				<h2>{{ group }}</h2>
				<table>
					<thead>
						<tr>
							<th>S/No.</th>
							<th>Name</th>
							<th>Months</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(publisher, count) in groupPublishers(group)" :key="publisher + '|' + count" style="cursor:pointer" v-if="missingRecord(publisher) !== '' && publisher.fieldServiceGroup == group && (publisher.name.toLowerCase().includes(searchTerms) || publisher.contactInformation.address.toLowerCase().includes(searchTerms) || publisher.contactInformation.phoneNumber.toLowerCase().includes(searchTerms))">
							<td>{{ count + 1 }}</td>
							<td>{{ publisher.name }}</td>
							<td>{{ missingRecord(publisher) }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<!--div>
			<div v-for="(group) in allGroups" :key="group" v-if="(selectedGroup == group || selectedGroup == 'All Field Service Groups') && (groupPublishers(group).filter(elem=>elem.name.toLowerCase().includes(searchTerms) || elem.contactInformation.address.toLowerCase().includes(searchTerms) || elem.contactInformation.phoneNumber.toLowerCase().includes(searchTerms)).length !== 0)" class="grid-item">
				<h2 v-if="groupPublishers(group).filter(elem=>elem.name.toLowerCase().includes(searchTerms) || elem.contactInformation.address.toLowerCase().includes(searchTerms) || elem.contactInformation.phoneNumber.toLowerCase().includes(searchTerms)).length !== 0" class="main card-title" style="cursor:pointer">{{ group }}</h2>
				<div v-for="(publisher, count) in groupPublishers(group)" :key="publisher + '|' + count" style="cursor:pointer" v-if="publisher.name.toLowerCase().includes(searchTerms) || publisher.contactInformation.address.toLowerCase().includes(searchTerms) || publisher.contactInformation.phoneNumber.toLowerCase().includes(searchTerms)" @click="publisherDetail(publisher)">{{ publisher.name }}</div>
			</div>
		</div-->
		<div v-if="selectedPublisher.name">
            <p><input type="text" :value="selectedPublisher.name"></p>
            <p>Date of Birth: <input type="text" :value="selectedPublisher.dateOfBirth">
                <span><input type="checkbox">Male<span><input type="checkbox">Female</span>
            </p>
            <p>Date of Baptism: <input type="text" :value="selectedPublisher.dateOfBaptism">
                <span><input type="checkbox">Other Sheep<span><input type="checkbox">Anointed</span>
            </p>
            <p>
                <span><input type="checkbox">Elder<span><input type="checkbox">Ministerial Servant<span><input type="checkbox">Regular Pioneer<span><input type="checkbox">Special Pioneer<span><input type="checkbox">Field Missionary</span>
            </p>
            <div>Contact Information</div>
            <div>Ministry</div>
			<iframe v-if="pdfFile !== ''" :src="pdfFile" width="800" height="700" style="border: none;"></iframe>
		</div>
		
    </div>
</template>`

function processMissingReport() {

    missingReportVue = new Vue({
        el: document.querySelector('#missingReport'),
        data: {
            //processedGroups: [],
            display: false,
            pdfFile: "",
			selectedPublisher: {},
        },
        computed: {
            publishers() {
                return allPublishersVue.publishers
            },
			searchTerms() {
                return navigationVue.searchTerms
            },
			allGroups() {
                return navigationVue.allGroups
            },
			selectedGroup() {
                return navigationVue.fieldServiceGroup
            },
        },
        methods: {
			groupPublishers(group) {
                return allPublishersVue.publishers.filter(elem=>elem.fieldServiceGroup == group)
            },
			publisherDetail(publisher) {
				this.selectedPublisher = publisher
                //fillPublisherRecord(publisher)
			},
            updateRecord(publisher) {
				updatePublisherRecord(publisher)
			},
            missingRecord(publisher) {
				var publisherRecords = ''
				monthlyReportVue.months.slice(0, monthlyReportVue.months.findIndex(elem=>elem.abbr == monthlyReportVue.month.abbr) + 1).forEach(elem=>{
					if (publisher.report.currentServiceYear[`${elem.abbr}`].sharedInMinistry !== true) {
						publisherRecords += '; ' + elem.fullName
					}
				})
				
				return publisherRecords.replace('; ','')
			},
        }
    })
}


document.querySelector('#attendance').innerHTML = `<template>
	<div v-if="display == true">
		<h1>Monthly Attendance</h1>
		<section style="padding:10px; margin:5px; border: 1px solid gray">
		<h2>{{ congregationName }} [{{ month.fullName }} {{ year }}] <span v-if="saved !== 0">[Saving record. Please wait . . .]</span></h2>
			<div>
                <table>
					<thead>
						<tr>
							<th></th>
							<th v-for="(week, count) in weeks">{{ week }}</th>
							<th>Total</th>
							<th>Average</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(meeting, count) in currentMonth.meetings" :key="count">
							<td>{{ meeting.name }} Meeting</td>
							<td v-for="(attendance) in meeting.attendance"><input :class="attendance.name" type="number" min="0" max="9999" style="width: 50px;" :value="attendance.count" @change="handleInputChange(attendance, $event.target)"></td>
							<td>{{ totalAttendance(meeting) }}</td>
							<td>{{ averageAttendance(meeting) }}</td>
						</tr>
					</tbody>
				</table>
            </div>
		</section>
		<h1>Meeting Attendance Record</h1>
		<section v-for="(meeting) in meetingAttendanceRecord.meetings" :key="meeting.name" style="padding:10px; margin:5px; border: 1px solid gray">
			<h2>{{ meeting.name }} <span v-if="saved !== 0">[Saving record. Please wait . . .]</span></h2>
			<div v-for="(serviceYear) in serviceYears" :key="serviceYear" style="display:flex; margin: 5px">
                <table>
					<thead>
						<tr>
							<th>Service Year {{ meeting[serviceYear].year }}</th>
							<th>Number of Meetings</th>
							<th>Total Attendance</th>
							<th>Average Attendance Each Week</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(month) in months" :key="month.abbr">
							<td>{{ month.fullName }}</td>
							<td><input class="numberOfMeetings" type="number" min="0" max="5" style="width: 30px;" :value="meeting[serviceYear][month.abbr].numberOfMeetings" @change="handleRecordInputChange(meeting[serviceYear][month.abbr], $event.target)"></td>
							<td><input class="totalAttendance" type="number" min="0" max="9999" style="width: 50px;" :value="meeting[serviceYear][month.abbr].totalAttendance" @change="handleRecordInputChange(meeting[serviceYear][month.abbr], $event.target)"></td>
							<td><input class="averageAttendanceEachWeek" type="number" min="0" max="9999" style="width: 50px;" :value="meeting[serviceYear][month.abbr].averageAttendanceEachWeek" @change="handleRecordInputChange(meeting[serviceYear][month.abbr], $event.target)"></td>
						</tr>
					</tbody>
				</table>
            </div>
		</section>
    </div>
</template>`

function processAttendance() {

    attendanceVue = new Vue({
        el: document.querySelector('#attendance'),
        data: {
            saved: 0,
            display: false,
			currentMonth: {},
			meetingAttendanceRecord: {},
			serviceYears: ["currentServiceYear", "lastServiceYear"],
            weeks: ['1st week', '2nd week', '3rd week', '4th week', '5th week'],
            meetings: ['Midweek Meeting', 'Weekend Meeting'],
            months: [{"abbr": "sept", "fullName": "September"}, {"abbr": "oct", "fullName": "October"}, {"abbr": "nov", "fullName": "November"}, {"abbr": "dec", "fullName": "December"}, {"abbr": "jan", "fullName": "January"}, {"abbr": "feb", "fullName": "February"}, {"abbr": "mar", "fullName": "March"}, {"abbr": "apr", "fullName": "April"}, {"abbr": "may", "fullName": "May"}, {"abbr": "jun", "fullName": "June"}, {"abbr": "jul", "fullName": "July"}, {"abbr": "aug", "fullName": "August"} ],

        },
        computed: {
            congregationName() {
                return congregationVue.congregation.congregationName
            },
            searchTerms() {
                return navigationVue.searchTerms
            },
			selectedGroup() {
                return navigationVue.fieldServiceGroup
            },
			allGroups() {
                return navigationVue.allGroups
            },
			month() {
				return monthlyReportVue.months.slice(3).concat(monthlyReportVue.months.slice(0,3))[new Date().getMonth()]
                ///return this.months[0].abbr
            },
			year() {
				var currentYear;
				if (new Date().getMonth() == 0) {
					currentYear = new Date().getFullYear() - 1
				} else {
					currentYear = new Date().getFullYear()
				}

				this.meetingAttendanceRecord.meetings[0].currentServiceYear.year = 2024
				this.meetingAttendanceRecord.meetings[1].currentServiceYear.year = 2024
				this.meetingAttendanceRecord.meetings[0].lastServiceYear.year = 2023
				this.meetingAttendanceRecord.meetings[1].lastServiceYear.year = 2023
				return currentYear
            },
        },
        methods: {
			cleanDate(date) {
                const currentDate = new Date(date);

                const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

                return formattedDate
            },
			averageAttendance(attendance) {
				const numbersArray = attendance.attendance.filter(elem=>elem.count !== null)
				if (numbersArray.length === 0) {
					this.meetingAttendanceRecord.meetings.filter(elem=>elem.name.startsWith(attendance.name))[0].currentServiceYear[`${this.month.abbr}`].numberOfMeetings = null
					this.meetingAttendanceRecord.meetings.filter(elem=>elem.name.startsWith(attendance.name))[0].currentServiceYear[`${this.month.abbr}`].totalAttendance = null
					this.meetingAttendanceRecord.meetings.filter(elem=>elem.name.startsWith(attendance.name))[0].currentServiceYear[`${this.month.abbr}`].averageAttendanceEachWeek = null
					return null; // Return 0 for an empty array (avoid division by zero)
				}
				
				const sum = numbersArray.reduce((accumulator, currentValue) => {
					return accumulator + currentValue.count;
				}, 0);
				
				const average = sum / numbersArray.length;

				this.meetingAttendanceRecord.meetings.filter(elem=>elem.name.startsWith(attendance.name))[0].currentServiceYear[`${this.month.abbr}`].numberOfMeetings = numbersArray.length 
				this.meetingAttendanceRecord.meetings.filter(elem=>elem.name.startsWith(attendance.name))[0].currentServiceYear[`${this.month.abbr}`].totalAttendance = sum
				this.meetingAttendanceRecord.meetings.filter(elem=>elem.name.startsWith(attendance.name))[0].currentServiceYear[`${this.month.abbr}`].averageAttendanceEachWeek = average
				
				return average;
			  },
			totalAttendance(attendance) {
				const numbersArray = attendance.attendance.filter(elem=>elem.count !== null)
				if (numbersArray.length === 0) {
					return null; // Return 0 for an empty array (avoid division by zero)
				}
				
				return numbersArray.reduce((accumulator, currentValue) => {
					return accumulator + currentValue.count;
				}, 0);
			},
			handleRecordInputChange(attendance, event) {
				if (event.value == '' || event.value == '0') {
					attendance[`${event.className}`] = null
				} else {
					attendance[`${event.className}`] = Number(event.value)
				}
				DBWorker.postMessage({ storeName: 'attendance', action: "save", value: [this.meetingAttendanceRecord]});
			},
            handleInputChange(attendance, event) {
				if (event.value == '' || event.value == '0') {
					attendance.count = null
				} else {
					attendance.count = Number(event.value)
				}
				DBWorker.postMessage({ storeName: 'attendance', action: "save", value: [this.currentMonth]});
			},
			sumHours(publisher) {
                var totalHours = 0
                this.months.forEach(elem=>{
                    const value = publisher.report.currentServiceYear[elem.abbr].hours
                    if (value !== null) {
                        totalHours = totalHours + value
                    }
                })
                return totalHours
            }
        }
    })
}

processAllPublishers()
processCongregation()
processConfiguration()
processFieldServiceGroups()
processMonthlyReport()
processMissingReport()
processAttendance()

var defaultConfiguration = {"congregationName": "Congregation Name", "name": "Congregation", "address": "Congregation Address", "email": "Congregation Email", "fieldServiceGroups": ["Group 1", "Group 2", "Group 3"]}

var currentMonthAttendance = {
	"name": "Monthly",
	"month": currentMonth,
	"meetings": [
		{
			"name": "Midweek",
			"attendance": [
				{ "name": "1stWeek", "count": null },
				{ "name": "2ndWeek", "count": null },
				{ "name": "3rdWeek", "count": null },
				{ "name": "4thWeek", "count": null },
				{ "name": "5thWeek", "count": null }
			]
		},
		{
			"name": "Weekend",
			"attendance": [
				{ "name": "1stWeek", "count": null },
				{ "name": "2ndWeek", "count": null },
				{ "name": "3rdWeek", "count": null },
				{ "name": "4thWeek", "count": null },
				{ "name": "5thWeek", "count": null }
			]
		}
	]
}

var meetingAttendanceRecord = {
	"name": "Meeting Attendance Record",
	"meetings" : [
		{
			"name": "Midweek Meeting",
			"currentServiceYear": {
				"year": null,
				"jan": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"feb": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"mar": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"apr": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"may": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"jun": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"jul": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"aug": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"sept": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"oct": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"nov": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"dec": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"averageAttendanceEachMonth": null
			},
			"lastServiceYear": {
				"year": null,
				"jan": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"feb": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"mar": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"apr": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"may": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"jun": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"jul": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"aug": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"sept": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"oct": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"nov": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"dec": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"averageAttendanceEachMonth": null
			}
		},
		{
			"name": "Weekend Meeting",
			"currentServiceYear": {
				"year": null,
				"jan": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"feb": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"mar": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"apr": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"may": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"jun": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"jul": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"aug": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"sept": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"oct": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"nov": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"dec": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"averageAttendanceEachMonth": null
			},
			"lastServiceYear": {
				"year": null,
				"jan": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"feb": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"mar": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"apr": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"may": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"jun": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"jul": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"aug": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"sept": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"oct": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"nov": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"dec": {
					"numberOfMeetings": null,
					"totalAttendance": null,
					"averageAttendanceEachWeek": null
				},
				"averageAttendanceEachMonth": null
			}
		}
	]
}

var newPublisherRecord = {
    "name": null,
    "dateOfBirth": null,
    "gender": null,
    "hope": null,
    "privilege": [],
    "contactInformation": {
        "address": null,
        "phoneNumber": null
    },
    "fieldServiceGroup": null,
    "report": {
        "currentServiceYear": {
            "year": null,
            "jan": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "feb": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "mar": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "apr": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "may": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "jun": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "jul": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "aug": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "sept": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "oct": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "nov": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "dec": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "totalHours": null,
            "totalRemarks": null
        },
        "lastServiceYear": {
            "year": null,
            "jan": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "feb": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "mar": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "apr": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "may": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "jun": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "jul": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "aug": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "sept": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "oct": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "nov": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "dec": {
                "sharedInMinistry": null,
                "bibleStudies": null,
                "auxiliaryPioneer": null,
                "hours": null,
                "remarks": null,
                "modified": null,
                "created": null
            },
            "totalHours": null,
            "totalRemarks": null
        }
    },
    "dateOfBaptism": null,
    "emergencyContactInformation": {
        "name": null,
        "phoneNumber": null
    }
}

configurationVue.publisher = newPublisherRecord

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

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    fieldServiceGroupsVue.pdfFile = URL.createObjectURL(file);
    /*a.href = URL.createObjectURL(file);
    
    //a.download = fileName;
    //a.click();*/
};

async function fillPublisherRecord(publisher) {
    // Get the form field by name
    //const fieldName = fieldNameInput.value;
    const name = s21.getForm().getTextField('900_1_Text_SanSerif');
    const dateOfBirth = s21.getForm().getTextField('900_2_Text_SanSerif');
    const dateOfBaptism = s21.getForm().getTextField('900_5_Text_SanSerif');
    const male = s21.getForm().getCheckBox('900_3_CheckBox');
    const female = s21.getForm().getCheckBox('900_4_CheckBox');

    name.setText(publisher.name)
    dateOfBirth.setText(publisher.dateOfBirth)
    dateOfBaptism.setText(publisher.dateOfBaptism)
    if (publisher.gender == "Male") {
        male.check()
        female.uncheck()
    } else if (publisher.gender == "Female") {
        male.uncheck()
        female.check()
    }
    //name.setText(publisher.name)
    //name.setText(publisher.name)
    // Save the modified PDF
    const modifiedPdfBytes = await s21.save();
    download(modifiedPdfBytes, publisher.name + ".pdf", "application/pdf");
}

/**
 * // Save the modified PDF
const modifiedPdfBytes = await pdfDoc.save();

// Create a Blob from the modified PDF bytes
const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

// Create a data URL from the Blob
const dataUrl = URL.createObjectURL(blob);

// Set the new data URL as the source for the iframe
iframe.src = dataUrl;
 */

function updatePublisherRecord(publisher) {
    publisher.gender = "Male"
    

    const name = s21.getForm().getTextField('900_1_Text_SanSerif');
    const dateOfBirth = s21.getForm().getTextField('900_2_Text_SanSerif');
    const dateOfBaptism = s21.getForm().getTextField('900_5_Text_SanSerif');
    const male = s21.getForm().getCheckBox('900_3_CheckBox');
    const female = s21.getForm().getCheckBox('900_4_CheckBox');

    console.log(name.getText(), dateOfBirth.getText(), dateOfBaptism.getText(), male.isChecked(), female.isChecked())
return
    

    publisher.name = name.getText()
    publisher.dateOfBirth = dateOfBirth.getText()
    publisher.dateOfBaptism = dateOfBaptism.getText()
    if (male.isChecked()) {
        publisher.gender = "Male"
    } else if (female.isChecked()) {
        publisher.gender = "Female"
    }
    console.log(publisher)
}

// 900_1_Text_SanSerif

var s21, s21form;

async function getFieldByName() {
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = async function (e) {
            const pdfData = new Uint8Array(e.target.result);

            // Using pdf-lib to load the PDF document
            s21 = await PDFLib.PDFDocument.load(pdfData);
        };

        reader.readAsArrayBuffer(file);
    }
}

/**
 * DBWorker.postMessage({ storeName: 'files', action: "save", value: [document.getElementById('pdfFile').files[0]]});
 */

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