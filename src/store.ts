import {defineStore} from "pinia";
import {ref} from "vue";
import {UserType} from "@/common";

export const useCommonStore = defineStore("common",()=>{
    const username = ref('');
    const usertype = ref<UserType>(UserType.Patient);
    const detail = ref({
        name: "",
        sex: "",
        birth: "",
        phone:"",
        email:"",
        password:"",
        address:""

    });
    const menu = ref<any>(null)
    return {username, usertype,detail,menu};
})
enum Status {
    Checking = 0,
    Completed = 1,
    Abnormality = 2,
    Error = 3,
}

export const useHistoryStore = defineStore("histoy",()=>{
    const id = ref<number>(0);
    const doctor = ref<string>("");
    const patient = ref<string>("");
    const sub_time = ref<string>("");
    const current_status = ref<Status>(Status.Checking);
    
    return {id, doctor, patient, sub_time,current_status};
})

export interface UserData {
    username: string;
    type: UserType;
  }
  
  export interface UserResponse {
    user: UserData;
  }