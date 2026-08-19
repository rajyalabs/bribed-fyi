export type IndianState = {
  name: string;
  code: string;
};

export const INDIAN_STATES: IndianState[] = [
  { name: "Andaman & Nicobar", code: "an" },
  { name: "Andhra Pradesh", code: "ap" },
  { name: "Arunachal Pradesh", code: "ar" },
  { name: "Assam", code: "as" },
  { name: "Bihar", code: "br" },
  { name: "Chandigarh", code: "ch" },
  { name: "Chhattisgarh", code: "ct" },
  { name: "Dadra & Nagar Haveli", code: "dn" },
  { name: "Daman & Diu", code: "dd" },
  { name: "Delhi", code: "dl" },
  { name: "Goa", code: "ga" },
  { name: "Gujarat", code: "gj" },
  { name: "Haryana", code: "hr" },
  { name: "Himachal Pradesh", code: "hp" },
  { name: "Jammu & Kashmir", code: "jk" },
  { name: "Jharkhand", code: "jh" },
  { name: "Karnataka", code: "ka" },
  { name: "Kerala", code: "kl" },
  { name: "Lakshadweep", code: "ld" },
  { name: "Madhya Pradesh", code: "mp" },
  { name: "Maharashtra", code: "mh" },
  { name: "Manipur", code: "mn" },
  { name: "Meghalaya", code: "ml" },
  { name: "Mizoram", code: "mz" },
  { name: "Nagaland", code: "nl" },
  { name: "Odisha", code: "or" },
  { name: "Puducherry", code: "py" },
  { name: "Punjab", code: "pb" },
  { name: "Rajasthan", code: "rj" },
  { name: "Sikkim", code: "sk" },
  { name: "Tamil Nadu", code: "tn" },
  { name: "Telangana", code: "tg" },
  { name: "Tripura", code: "tr" },
  { name: "Uttar Pradesh", code: "up" },
  { name: "Uttarakhand", code: "ut" },
  { name: "West Bengal", code: "wb" },
];

export const STATE_BY_CODE = Object.fromEntries(INDIAN_STATES.map((s) => [s.code, s]));
export const STATE_BY_NAME = Object.fromEntries(INDIAN_STATES.map((s) => [s.name, s]));

export function codeForState(name: string) {
  return STATE_BY_NAME[name]?.code ?? "";
}
