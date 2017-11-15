 var config = {
    apiKey: "AIzaSyA88nEyhePVdgD2lEWoCgRrNxgQXDwNhe4",
    authDomain: "train-activity-bd97c.firebaseapp.com",
    databaseURL: "https://train-activity-bd97c.firebaseio.com",
    projectId: "train-activity-bd97c",
    storageBucket: "train-activity-bd97c.appspot.com",
    messagingSenderId: "286463972054"
 };
 firebase.initializeApp(config);

var defaultDatabase = firebase.database();

//interval listener
var timerId;
//Event happens once
var childListener = false;
//Database clarity
var ref = defaultDatabase.ref();
var filter = ref.orderByChild('dateAdded').limitToLast(1);

/*This function returns an array of the minutesToNextTrain and the nextTrain.*/
function calculateTime(info){
	var trainFreq = parseInt(info.frequency);
	var now = moment();
	var firstTime = moment(info.firstTrain, "HH:mm");

	var differenceInTime = now.diff(moment(firstTime), "minutes");
	//edge case
	if (differenceInTime < 0){
		firstTime = moment(info.firstTrain, "HH:mm").subtract(1, "days");
		differenceInTime = now.diff(moment(firstTime), "minutes");
	}

	var remainder = differenceInTime % trainFreq;
	var minutesToNextTrain = trainFreq - remainder;
	var nextTrain = now.add(minutesToNextTrain, "minutes").format('hh:mm A');
	
	return [nextTrain, minutesToNextTrain];

}
function createTable(info){
	console.log(info);

	var calculatedInfo = calculateTime(info);

	var $trainRowDiv = $('<tr>').attr('id', info.dateAdded);
	$trainRowDiv.append(
		'<td>' + info.trainName + '</td>' +
		'<td>' + info.destination + '</td>' +
		'<td>' + info.frequency + '</td>' +
		'<td class = "nextArrivalData">' + calculatedInfo[0] + '</td>' +
		'<td class = "minutesAwayData">' + calculatedInfo[1] + '</td>'
	);

	$('#trainTable').append($trainRowDiv);
}


defaultDatabase.ref().once("value", function(snapshot) {
	snapshot.forEach(function(child){
		createTable(child.val());
	});
});


filter.on('child_added',function(snapshot){
	if(childListener){
		var info = snapshot.val();
		createTable(info);
	}
});

$('#run-submit').on('click',function(event){

	event.preventDefault();

	if ($('#trainName').val().trim() != ''){
		if(!childListener) childListener = true;
		var trainIn = $('#trainName').val().trim();
		var destinationIn = $('#destination').val().trim();
		var firstTimeIn = $('#firstTrainTime').val().trim();	
		var frequencyIn = $('#frequency').val().trim();


		var newTrain = {
			trainName: trainIn,
			destination: destinationIn,
			firstTrain: firstTimeIn,
			frequency: frequencyIn,
			dateAdded: firebase.database.ServerValue.TIMESTAMP
		}

		defaultDatabase.ref().push(newTrain);

		$('#trainName').val('');
		$('#destination').val('');
		$('#firstTrainTime').val('');
		$('#frequency').val('');
	}
});

/*-------------------Timer Functionality-------------------------*/

function updateTable(){
	defaultDatabase.ref().once("value", function(snapshot) {
		snapshot.forEach(function(child){
			var rowIdChildren = document.getElementById(child.val().dateAdded).childNodes;
			var newInfo = calculateTime(child.val());
			
			rowIdChildren[3].innerHTML = newInfo[0];
			rowIdChildren[4].innerHTML = newInfo[1];
		});
	});
}
timerId = setInterval(updateTable, 60000);
