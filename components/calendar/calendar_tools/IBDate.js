import CONST from "../../tools/constants/CONST";

export default class IBDate {
  year = 2024;
  month = 9;
  date = 27;
  day = 5;
  localday = 2;
  constructor(date) {
    if (date) {
      this.year = date.year || date.getFullYear();
      this.month = date.month || date.getMonth() + 1;
      this.date = date.date || date.getDate();
      if (date.getDay) this.day = date.getDay() + 1;
      else this.day = date.day || this.day;
      this.correct();
    }
  }

  static monthLength = (month, year) => {
    switch (month) {
      case 1: //January
      case 3: //March
      case 5: //May
      case 7: //July
      case 8: //August
      case 10: //October
      case 12: //December
        return 31;
      case 2: //February
        return year % 4 == 0 ? 29 : 28;
      default: //April June September November
        return 30;
    }
  };

  equals = (date) => {
    return (
      date.year == this.year &&
      date.month == this.month &&
      date.date == this.date
    );
  };

  isGreaterThan = (date) => {
    if (this.year > date.year) return true;
    if (this.year == date.year && this.month > date.month) return true;
    if (
      this.year == date.year &&
      this.month == date.month &&
      this.date > date.date
    )
      return true;
    return false;
  };

  isLesserThan = (date) => {
    // //console.log("Hey", this.day < date.month);
    if (this.year < date.year) return true;
    if (this.year == date.year && this.month < date.month) return true;
    if (
      this.year == date.year &&
      this.month == date.month &&
      this.date < date.date
    )
      return true;
    return false;
  };

  correct = () => {
    var date = new IBDate();
    while (this.isLesserThan(date)) {
      date.prevDay();
      // //console.log("Prev : ", date.toString());
    }
    while (this.isGreaterThan(date)) {
      date.nextDay();
      // //console.log("Next : ", date.toString());
    }
    this.year = date.year;
    this.month = date.month;
    this.date = date.date;
    this.day = date.day;
    this.localday = date.localday;
  };

  nextDay = () => {
    this.localday = (this.localday + 1) % 4;
    this.day = (this.day + 1) % 7;
    this.date = (this.date % IBDate.monthLength(this.month, this.year)) + 1;
    if (this.date == 1) this.month = (this.month % 12) + 1;
    if (this.month == 1 && this.date == 1) this.year = this.year + 1;
  };

  prevDay = () => {
    this.localday = this.localday == 0 ? 3 : this.localday - 1;
    this.day = this.day == 0 ? 6 : this.day - 1;

    const old_date = this.date;
    const old_month = this.month;
    const prev_month_lastdate = IBDate.monthLength(
      this.month == 1 ? 12 : this.month - 1,
      this.month == 1 ? this.year - 1 : this.year
    );
    this.date = this.date == 1 ? prev_month_lastdate : this.date - 1;
    if (old_date == 1) this.month = this.month == 1 ? 12 : this.month - 1;
    if (old_month == 1 && old_date == 1) this.year = this.year - 1;
  };

  shiftDate(amount) {
    if (amount > 0) {
      for (let i = 0; i < amount; i++) this.nextDay();
    } else {
      for (let i = 0; i > amount; i--) this.prevDay();
    }
  }

  nextMonth = () =>
    this.shiftDate(IBDate.monthLength(this.month, this.year) - this.date + 1);
  prevMonth = () => {
    this.shiftDate(-this.date);
    this.shiftDate(1 - IBDate.monthLength(this.month, this.year));
  };
  shiftMonth = (amount) => {
    if (amount > 0) {
      for (let i = 0; i < amount; i++) this.nextMonth();
    } else {
      for (let i = 0; i > amount; i--) this.prevMonth();
    }
  };

  nextYear = () => this.shiftMonth(12 - this.month + 1);
  prevYear = () => {
    this.shiftMonth(-this.month);
    this.shiftMonth(-11);
  };
  shiftYear = (amount) => {
    if (amount > 0) {
      for (let i = 0; i < amount; i++) this.nextYear();
    } else {
      for (let i = 0; i > amount; i--) this.prevYear();
    }
    //console.log("Done! Shift Year");
  };

  firstDay = () => {
    this.date = 1;
    this.correct();
  };

  firstMonth = () => {
    this.shiftMonth(1 - this.month);
    this.date = 1;
    this.correct();
  };

  toString = (separator) => {
    const sep = separator || "/";
    return (
      this.date +
      sep +
      this.month +
      sep +
      this.year +
      " :: " +
      this.day +
      sep +
      this.localday
    );
  };

  toText = (abv) => {
    const sep = " - ";
    return (
      this.date +
      sep +
      (abv ? CONST.Month_Abv[this.month - 1] : CONST.Month[this.month - 1]) +
      sep +
      this.year +
      " " +
      (abv ? CONST.Day_Abv[this.day] : CONST.Day[this.day]) +
      ", " +
      CONST.LocalDay[this.localday]
    );
  };
}
