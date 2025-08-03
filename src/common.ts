import { inject } from "vue";
import type { VueCookies } from "vue-cookies";

export enum UserSex {
    Female = 0,
    Male = 1,
}

export enum UserType {
    Patient = 0,
    Doctor = 1,
    Admin = 2
}

// Role-based permissions
export enum Permission {
    // User management
    VIEW_USERS = 'view_users',
    MANAGE_USERS = 'manage_users',
    DELETE_USERS = 'delete_users',

    // Report management
    VIEW_REPORTS = 'view_reports',
    CREATE_REPORTS = 'create_reports',
    EDIT_REPORTS = 'edit_reports',
    DELETE_REPORTS = 'delete_reports',

    // Admin functions
    SYSTEM_CONFIG = 'system_config',
    VIEW_AUDIT_LOGS = 'view_audit_logs',
    MANAGE_ROLES = 'manage_roles'
}

export enum ImageType {
    source = 0,
    result = 1
}

export const API_ADDRESS: string = "http://122.152.199.145:6501";
// export const API_ADDRESS: string = "http://127.0.0.1:8889";

export let useCookies = (): VueCookies => inject<VueCookies>("$cookies")!