import {defineStore} from "pinia";
import {ref} from "vue";
import {UserType} from "@/common";

export const useCommonStore = defineStore("common",()=>{
    const username = ref('');
    const usertype = ref<UserType>(UserType.Patient);
    const userId = ref('');
    const userRoles = ref<Array<{name: string, [key: string]: any}>>([]);
    const userPermissions = ref<any[]>([]);
    const detail = ref({
        name: "",
        sex: null as number | null,
        birth: "",
        phone:"",
        email:"",
        password:"",
        address:""
    });
    const menu = ref<any>(null);
    
    // 检查用户是否有特定角色
    const hasRole = (roleName: string) => {
        return userRoles.value.some(role => role.name === roleName);
    };
    
    // 检查用户是否有特定权限
    const hasPermission = (resource: string, action: string) => {
        return userPermissions.value.some(perm => 
            perm.resource === resource && perm.action === action
        );
    };
    
    // 检查用户是否是管理员
    const isAdmin = () => {
        return hasRole('admin') || usertype.value === UserType.Doctor && hasRole('admin');
    };
    
    // 检查用户是否是医生
    const isDoctor = () => {
        return usertype.value === UserType.Doctor || hasRole('doctor');
    };
    
    // 检查用户是否是患者
    const isPatient = () => {
        return usertype.value === UserType.Patient || hasRole('patient');
    };
    
    // 清除用户信息
    const clearUserInfo = () => {
        username.value = '';
        userId.value = '';
        usertype.value = UserType.Patient;
        userRoles.value = [];
        userPermissions.value = [];
        detail.value = {
            name: "",
            sex: null,
            birth: "",
            phone:"",
            email:"",
            password:"",
            address:""
        };
    };
    
    return {
        username, 
        usertype, 
        userId,
        userRoles,
        userPermissions,
        detail,
        menu,
        hasRole,
        hasPermission,
        isAdmin,
        isDoctor,
        isPatient,
        clearUserInfo
    };
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