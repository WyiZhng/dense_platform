import axios from "axios";
import {API_ADDRESS, ImageType, type UserType} from "@/common";

export const axiosInstance = axios.create({
    baseURL: API_ADDRESS + "/api/",
    timeout: 1000,

  });


export async function getUserInfo(token:string) {
   return await axiosInstance.post("info",{
        token:token
    })
}

export async function submitUserInfo(token:string,form:any) {
    return await axiosInstance.post("submitInfo",{
         token:token,
         form:form
     })
 }

export async function submitDoctorInfo(token:string,form:any) {
    return await axiosInstance.post("/doctor/info/set",{
        token:token,
        form:form
    })
}


export async function getAvatar(token:string) {
    return await axiosInstance.post("avatar",{
        token:token
    },{responseType: "blob"})
}

export async function uploadAvatar(token:string,image:number) {
    return axiosInstance.post("submitAvatar",{
        token:token,
        id:image
    })
}

export function saveUser(){
    
}

export async function login(username: string, password: string): Promise<any> {
    return await axiosInstance.post("login", {
        username,
        password
    });
}

export async function register(userName:string,passWord:string,type:UserType){
    return await axiosInstance.post("register",{
        username:userName,
        password:passWord,
        type:type,
    })
}


export async function submitReport(token:string,doctor:string,file:number[]) {
    return await axiosInstance.post("submitReport",{
        token:token,
        doctor:doctor,
        images:file
    })
    
}

export async function getDoctors(token:string){
    return await axiosInstance.post("doctors",{
        token:token
    })
}

export async function getReports(token:string){
    return await axiosInstance.post("getReports",{
        token:token,
    })
    
}

export async function getUserSimpleInfo(token:string){
    return await axiosInstance.post("user",{
        token:token,
    })
}

export async function getImagesOfReport(token:string,id:string,type:ImageType){
    return await axiosInstance.post("report/images",{
        token:token,
        id:id,
        type:type
    })
    
}

export async function getImageData(token:string,id:string){
    return await axiosInstance.post("image/get",{
        token:token,
        id:id,
    },{
        responseType:"blob"
    })
}

export async function deleteReport(token:string,id:number){
    return await axiosInstance.post("report/delete",{
        token:token,
        id:id,
    })
}

export async function predict(token:string,doctor:string,file:number[]) {
    return await axiosInstance.post("algorithm/predict",{
        token:token,
        doctor:doctor,
        images:file
    })
    
}