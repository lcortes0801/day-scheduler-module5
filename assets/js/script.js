currentDayElement = $('#currentDay');

var schedule = {};
var lastActiveTextArea = null;
var today;

$(document).ready(()=>{
    
    var now = moment();
    currentDayElement.text(now.format("dddd, MMMM Do YYYY"));

    today = now.format('YYYYMMDD');
    schedule = JSON.parse(window.localStorage.getItem('schedule'));
    if (schedule === null){
        schedule = {};
        schedule[today]={};
    }
    else{
        let keys = Object.keys(schedule);
        var found = false;
        for(key of keys)
            if(key === today)
                found = true;
        if (!found){
            schedule[today] = {};
        }
        else{
            // remove all keys but today's 
            let todayData = schedule[today];
            schedule = {};
            schedule[today] = todayData;
        }
    }
    window.localStorage.setItem('schedule', JSON.stringify(schedule));
    
    let tb = $('.time-blocks');
    for(let i = 0, hour = moment("09:00:00", "hh:mm:ss"); i < 9; ++i, hour.add(1,'hours')){
        let dayRow = $('<div>');
        dayRow.addClass('row');

        let timeCol = $('<div>');
        timeCol.addClass('col-1');
        timeCol.addClass('hour');
        let timeVal = hour.format('hA');
        let timeKey = hour.format('HH');
        timeCol.text(timeVal);

        let eventCol = $('<div>');
        eventCol.addClass('col-10 event');
        eventCol.attr('hour', timeKey);
        let eventInput = $('<textarea>');
        eventInput.attr('hour', timeKey);
        if (schedule[today][timeKey] !== undefined)
            eventInput.text(schedule[today][timeKey]);

        eventInput.focus((event)=>{
            event.preventDefault();
            var key;
            var originalSchedule;
            if (lastActiveTextArea !== null){
                key = lastActiveTextArea.attr('hour');
                originalSchedule = schedule[today][key];
            }
            if (lastActiveTextArea !== null && lastActiveTextArea.val() !== originalSchedule)
                removeText(lastActiveTextArea)
            lastActiveTextArea = $(event.target);
        })
        
        eventCol.append(eventInput);
        
        if (now < hour){
            timeCol.addClass('future-event-time')
            eventCol.addClass('future');
        }
        else {
            timeCol.addClass('past-event-time')
            eventInput.prop('disabled', true);
            if (now < hour.clone().add(1,'hours'))
                eventCol.addClass('present');
            else
                eventCol.addClass('past');
        }
        
        let lastCol = $('<div>');
        lastCol.addClass('col-1');
        lastCol.addClass('saveBtn');

        let saveIcon = $('<i>');
        saveIcon.attr('hour', timeKey);
        saveIcon.addClass('far fa-save');
        saveIcon.click(saveItem);
        lastCol.append(saveIcon);

        [timeCol, eventCol, lastCol].forEach(x=>dayRow.append(x))
        tb.append(dayRow);
    }

    setUpdater();    
    window.setTimeout(updateSlots, 3000);
});

function saveItem(event){
    let siblings = $(event.target).parent().parent().children();
    var key = $(event.target).attr('hour');
    var value = $(`textarea[hour=${key}]`).val();
    schedule[today][key] = value;
    window.localStorage.setItem('schedule', JSON.stringify(schedule));
    lastActiveTextArea = null;
}

function removeText(target) {
    target.animate({
      opacity: "-=1"
    }, 1000, function() {
        target.val('');
        target.css('opacity', '100%');
    });
  }

function setUpdater(){
    var now = moment();
    var next = moment().startOf('hour').add(1,'hour');
    var start = next - now;
    window.setTimeout(updateSlots, start);
}

function updateSlots(){
    let eventSlots = $('.event');
    classList = ['past', 'present', 'future'];
    for(item of eventSlots){
        var cl = $(item).attr('class').split(' ');
        for(c of cl)
            if (classList.includes(c))
                $(item).removeClass(c);
        let now = moment().format('HH');
        let hour = $(item).attr('hour');
        if (now < hour){
            $(item).addClass('future')
            $(`textarea[hour=${hour}]`).prop('disabled', false);
        }
        else {
            if (now < hour+1)
                $(item).addClass('present');
            else
                $(item).addClass('past');
            $(`textarea[hour=${hour}]`).prop('disabled', true);
        }
    }
    setUpdater();
}