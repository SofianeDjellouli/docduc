import fileDownload from "js-file-download";

export const currentMonth = new Date().getMonth(),
  currentYear = new Date().getFullYear();

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export const years = Array.from(new Array(currentYear - 2018), (x, i) => i + 2019);

const toPad = a => a.toString().padStart(2, "0");

export const formatDate = a =>
  a.getFullYear() + "-" + toPad(a.getMonth() + 1) + "-" + toPad(a.getDate());

export const toCsv = a => {
  var str =
    "appointment_id;typeID;start_time;end_time;duration;price;first_name;lastName;email;phone;addressLine1;addressLine2;city;state;zip;gender;DOB;member_policy_number;group_number;relationship;prim_firstName;prim_lastName;prim_phone;prim_addressLine1;prim_addressLine2;prim_city;prim_state;prim_zip;medical_history;surgical_history_procedures;surgical_history_dates;medications;allergies_name;allergies_reaction;insurance_name;insurance_plan;symptoms;note\r\n";
  for (let i = 0; i < a.length; i++) {
    let {
        appointment_id,
        start_time,
        end_time,
        typeID,
        duration,
        price,
        first_name,
        lastName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zip,
        gender,
        DOB,
        insurance_info: {
          member_policy_number,
          group_number,
          relationship,
          prim_firstName,
          prim_lastName,
          prim_phone,
          prim_addressLine1,
          prim_addressLine2,
          prim_city,
          prim_state,
          prim_zip
        },
        insurance_name,
        insurance_plan,
        note,
        medical: { medical_history, surgical_history, medications, allergies }
      } = a[i],
      symptoms = a[i].symptoms.map(({ name }) => name).join(", "),
      surgical_history_procedures,
      surgical_history_dates,
      allergies_name,
      allergies_reaction;
    surgical_history_procedures = surgical_history_dates = allergies_name = allergies_reaction = "";
    if (medical_history)
      medical_history = medical_history.map(({ condition }) => condition).join(", ");
    if (surgical_history) {
      surgical_history_procedures = surgical_history.map(({ procedure }) => procedure).join(", ");
      surgical_history_dates = surgical_history.map(({ date }) => date).join(", ");
    }
    if (medications) medications = medications.map(({ name }) => name).join(", ");
    if (allergies) {
      allergies_name = allergies.map(({ name }) => name).join(", ");
      allergies_reaction = allergies.map(({ reaction }) => reaction).join(", ");
    }
    str +=
      appointment_id +
      ";" +
      typeID +
      ";" +
      start_time +
      ";" +
      end_time +
      ";" +
      duration +
      ";" +
      price +
      ";" +
      first_name +
      ";" +
      lastName +
      ";" +
      email +
      ";" +
      phone +
      ";" +
      addressLine1 +
      ";" +
      addressLine2 +
      ";" +
      city +
      ";" +
      state +
      ";" +
      zip +
      ";" +
      gender +
      ";" +
      DOB +
      ";" +
      member_policy_number +
      ";" +
      group_number +
      ";" +
      relationship +
      ";" +
      prim_firstName +
      ";" +
      prim_lastName +
      ";" +
      prim_phone +
      ";" +
      prim_addressLine1 +
      ";" +
      prim_addressLine2 +
      ";" +
      prim_city +
      ";" +
      prim_state +
      ";" +
      prim_zip +
      ";" +
      medical_history +
      ";" +
      surgical_history_procedures +
      ";" +
      surgical_history_dates +
      ";" +
      medications +
      ";" +
      allergies_name +
      ";" +
      allergies_reaction +
      ";" +
      insurance_name +
      ";" +
      insurance_plan +
      ";" +
      symptoms +
      ";" +
      note +
      "\r\n";
  }
  fileDownload(str, "appointments.csv");
};
