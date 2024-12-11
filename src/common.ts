import {inject} from "vue";
import type {VueCookies} from "vue-cookies";

export enum UserSex{
    Female = 0,
    Male = 1,
}

export enum UserType{
    Patient = 0,
    Doctor = 1
}

export enum ImageType{
    source = 0,
    result = 1
}

export const API_ADDRESS:string = "http://172.31.214.18:8767";

export let useCookies = ():VueCookies => inject<VueCookies>("$cookies")!