import {getUserInfo} from "@/api";
import {type VueCookies} from "vue-cookies";

export async function updateUserInfo($cookies:VueCookies,store:{detail:any}){
    let resp = await getUserInfo($cookies.get('token'))
    store.detail = resp.data.form;
}//123