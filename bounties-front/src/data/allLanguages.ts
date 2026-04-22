import data from "./allLanguages.json";

export interface LanguageOption {
  value: string;
  label: string;
}

export const ALL_LANGUAGES: LanguageOption[] = data as LanguageOption[];
