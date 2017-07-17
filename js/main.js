var maxData = 3.0;
var currentData = 2.25;
var allDays = 28;
var daysLeft = 20;

var dataHasLoaded = false;

function setMultipleElementStyles(property,value,elements) {
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.setProperty(property,value);
    }
}

function displayPercentage(percent,q1,q2,q3,q4) {
    var rev = percent * 360;

    setMultipleElementStyles('display','',[q1,q2,q3,q4]);
    setMultipleElementStyles('transform','',[q1,q2,q3,q4]);

    if(rev < 0 || rev > 360) {
        return;
    } else if (rev <= 90) {
        setMultipleElementStyles('display','none',[q2,q3,q4]);

        var deg = -90 + rev;
        q1.style.setProperty('transform','rotate(' + deg.toString() + 'deg)');
    } else if (rev <= 180) {
        setMultipleElementStyles('display','none',[q3,q4]);

        var deg = -180 + rev;
        q2.style.setProperty('transform','rotate(' + deg.toString() + 'deg)');
    } else if (rev <= 270) {
        setMultipleElementStyles('display','none',[q4]);

        var deg = -270 + rev;
        q3.style.setProperty('transform','rotate(' + deg.toString() + 'deg)');
    } else if (rev <= 360) {

        var deg = -360 + rev;
        q4.style.setProperty('transform','rotate(' + deg.toString() + 'deg)');
    }
}

function updateCentralBars(data,days) {
    displayPercentage(
        data,
        document.querySelector('.data-used .q:nth-of-type(1)'),
        document.querySelector('.data-used .q:nth-of-type(2)'),
        document.querySelector('.data-used .q:nth-of-type(3)'),
        document.querySelector('.data-used .q:nth-of-type(4)')
    );
    displayPercentage(
        days,
        document.querySelector('.days-left .q:nth-of-type(1)'),
        document.querySelector('.days-left .q:nth-of-type(2)'),
        document.querySelector('.days-left .q:nth-of-type(3)'),
        document.querySelector('.days-left .q:nth-of-type(4)')
    );
}

function updateInformation() {
    updateCentralBars(currentData/maxData,daysLeft/allDays);
    document.querySelector('.data-used-text').innerHTML = currentData.toString() + '<span class="unit">GB</span>';
    document.querySelector('.days-left-text').innerHTML = daysLeft.toString() + '<span class="unit"> days left</span>';
    document.querySelector('.data-per-day-text').innerHTML = Math.floor(((currentData * 1000) / daysLeft)).toString() + '<span class="unit"> MB/day max</span>';
}

function revealInformation() {
    document.querySelector('.notready-cover').style.setProperty('opacity','0');
    document.querySelector('.notready-text').style.setProperty('opacity','0');
    document.querySelector('.graph.data-used').classList.add('twist');
    document.querySelector('.graph.days-left').classList.add('twist');
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('php/get_data.php').then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error('Could not reach data.');
        }
    }).then(function(parsed) {
        dataHasLoaded = true;

        currentData = parsed['data'];
        daysLeft = parsed['days_left'];

        updateInformation();
        revealInformation();
    });

    setTimeout(function() {
        dataHasLoaded = false;
        if(!dataHasLoaded) {
            document.querySelector('.notready-text').classList.add('anim');
        }
    },800);
});