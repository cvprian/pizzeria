/* global flatpickr */
import { settings, select } from '../settings.js';
import { BaseWidget } from './BaseWidget.js';
import {utils} from '../utils.js';

export class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
  
    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    flatpickr(thisWidget.dom.input, 
      {
        defaultDate: thisWidget.minDate, 
        minDate: thisWidget.minDate, 
        maxDate: thisWidget.maxDate, 
        locale: {firstDayOfWeek: 1}, 
        disable: [
          function(date){
            return (date.getDay() === 1);
          }
        ],
        onChange: function(dateStr) {
          thisWidget.value = utils.dateToStr(dateStr[0]);
          console.log(thisWidget.value);
        }
      }
    );
  }

  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){

  }
}