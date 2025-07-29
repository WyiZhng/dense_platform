import axios from "axios";
import {API_ADDRESS, ImageType, type UserType} from "@/common";
import { useGlobalErrorHandler } from "@/composables/useErrorHandler";

export const axiosInstance = axios.create({
    baseURL: API_ADDRESS + "/api/",
    timeout: 100000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage or cookies
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorHandler = useGlobalErrorHandler();
        
        let context = 'API Request';
        if (error.config?.url) {
            context = `API: ${error.config.url}`;
        }
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            const enhancedError = {
                ...error,
                code: `HTTP_${status}`,
                message: data?.message || data?.detail || error.message,
                context: context
            };
            
            switch (status) {
                case 401:
                    enhancedError.code = 'UNAUTHORIZED';
                    enhancedError.message = '登录已过期，请重新登录';
                    // Clear stored tokens
                    localStorage.removeItem('auth_token');
                    sessionStorage.removeItem('auth_token');
                    // Redirect to login if needed
                    break;
                case 403:
                    enhancedError.code = 'FORBIDDEN';
                    enhancedError.message = '您没有权限执行此操作';
                    break;
                case 404:
                    enhancedError.code = 'NOT_FOUND';
                    enhancedError.message = '请求的资源不存在';
                    break;
                case 422:
                    enhancedError.code = 'VALIDATION_ERROR';
                    enhancedError.message = '输入数据验证失败';
                    break;
                case 429:
                    enhancedError.code = 'RATE_LIMIT';
                    enhancedError.message = '请求过于频繁，请稍后重试';
                    break;
                case 500:
                    enhancedError.code = 'SERVER_ERROR';
                    enhancedError.message = '服务器内部错误，请稍后重试';
                    break;
            }
            
            errorHandler.handleError(enhancedError, context);
            return Promise.reject(enhancedError);
            
        } else if (error.request) {
            const networkError = {
                ...error,
                code: 'NETWORK_ERROR',
                message: '网络连接失败，请检查网络设置',
                context: context
            };
            
            errorHandler.handleError(networkError, context);
            return Promise.reject(networkError);
        } else {
            const unknownError = {
                ...error,
                code: 'UNKNOWN_ERROR',
                message: error.message || '发生未知错误',
                context: context
            };
            
            errorHandler.handleError(unknownError, context);
            return Promise.reject(unknownError);
        }
    }
);

// Authentication APIs
export async function login(username: string, password: string, rememberMe: boolean = false): Promise<any> {
    const response = await axiosInstance.post("auth/login", {
        username,
        password,
        remember_me: rememberMe
    });
    
    // Store token based on remember me preference
    if (response.data.token) {
        if (rememberMe) {
            localStorage.setItem('auth_token', response.data.token);
        } else {
            sessionStorage.setItem('auth_token', response.data.token);
        }
    }
    
    return response;
}

export async function register(username: string, password: string, userType: UserType, name?: string, email?: string, phone?: string): Promise<any> {
    const response = await axiosInstance.post("auth/register", {
        username,
        password,
        user_type: userType,
        name,
        email,
        phone
    });
    
    // Store token if registration is successful
    if (response.data.token) {
        sessionStorage.setItem('auth_token', response.data.token);
    }
    
    return response;
}

export async function logout(logoutAll: boolean = false): Promise<any> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (token) {
        try {
            await axiosInstance.post("auth/logout", {
                token,
                logout_all: logoutAll
            });
        } catch (error) {
            console.warn('Logout request failed:', error);
        }
    }
    
    // Clear stored tokens
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
}

export async function changePassword(username: string, oldPassword: string, newPassword: string): Promise<any> {
    return await axiosInstance.post("auth/change-password", {
        username,
        old_password: oldPassword,
        new_password: newPassword
    });
}

export async function getCurrentUser(): Promise<any> {
    return await axiosInstance.get("auth/me");
}

export async function refreshToken(): Promise<any> {
    return await axiosInstance.post("auth/refresh");
}

// User Management APIs
export async function getUserInfo(): Promise<any> {
    return await axiosInstance.post("info", {});
}

export async function updateUserInfo(form: any): Promise<any> {
    return await axiosInstance.post("submitInfo", { form });
}

export async function getAvatar(): Promise<any> {
    return await axiosInstance.post("avatar", {}, {
        responseType: "blob"
    });
}

export async function uploadAvatar(imageId: number): Promise<any> {
    return await axiosInstance.post("submitAvatar", {
        id: imageId
    });
}

// Password Reset APIs
export async function requestPasswordReset(email: string): Promise<any> {
    return await axiosInstance.post("auth/request-password-reset", {
        email
    });
}

export async function resetPassword(token: string, newPassword: string): Promise<any> {
    return await axiosInstance.post("auth/reset-password", {
        token,
        new_password: newPassword
    });
}

export async function verifyResetToken(token: string): Promise<any> {
    return await axiosInstance.post("auth/validate-reset-token", {
        token
    });
}

// Doctor APIs
export async function getDoctorInfo(): Promise<any> {
    return await axiosInstance.post("doctor/info", {});
}

export async function updateDoctorInfo(form: any): Promise<any> {
    return await axiosInstance.post("doctor/info/set", { form });
}

export async function getDoctors(): Promise<any> {
    return await axiosInstance.post("doctors", {});
}

// Report Management APIs
export async function getReports(page: number = 1, pageSize: number = 20, status?: string): Promise<any> {
    return await axiosInstance.post("getReports", {});
}

export async function getReportDetail(reportId: string): Promise<any> {
    return await axiosInstance.post("report/detail", {
        id: reportId
    });
}

export async function createReport(doctorId: string, images: number[]): Promise<any> {
    return await axiosInstance.post("submitReport", {
        doctor: doctorId,
        file: images
    });
}

export async function updateReportStatus(reportId: string, status: string, diagnosis?: string): Promise<any> {
    return await axiosInstance.post("report/diagnose/submit", {
        id: reportId,
        diagnose: diagnosis || status
    });
}

export async function deleteReport(reportId: string): Promise<any> {
    return await axiosInstance.post("report/delete", {
        id: reportId
    });
}

// Image Management APIs
export async function uploadImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return await axiosInstance.post("image", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export async function getImage(imageId: string): Promise<any> {
    return await axiosInstance.post("image/get", {
        id: imageId
    }, {
        responseType: "blob"
    });
}

export async function getReportImages(reportId: string, imageType: ImageType): Promise<any> {
    return await axiosInstance.post("report/images", {
        id: reportId,
        type: imageType
    });
}

// Comment System APIs
export async function getReportComments(reportId: string, page: number = 1, pageSize: number = 50): Promise<any> {
    return await axiosInstance.get(`user/report/${reportId}/comments`, {
        params: {
            page,
            page_size: pageSize
        }
    });
}

export async function addComment(reportId: string, content: string, parentId?: string, commentType: string = 'general', priority: string = 'normal'): Promise<any> {
    return await axiosInstance.post(`user/report/${reportId}/comment`, {
        content,
        parent_id: parentId,
        comment_type: commentType,
        priority
    });
}

export async function updateComment(commentId: string, content: string): Promise<any> {
    return await axiosInstance.put(`user/comment/${commentId}`, {
        content
    });
}

export async function deleteComment(commentId: string): Promise<any> {
    return await axiosInstance.delete(`user/comment/${commentId}`);
}

export async function resolveComment(commentId: string): Promise<any> {
    return await axiosInstance.post(`user/comment/${commentId}/resolve`);
}

// Admin APIs
export async function getSystemOverview(): Promise<any> {
    return await axiosInstance.get("admin/stats/overview");
}

export async function getUserStatistics(days: number = 30): Promise<any> {
    return await axiosInstance.get("admin/stats/users", {
        params: { days }
    });
}

export async function getReportStatistics(days: number = 30): Promise<any> {
    return await axiosInstance.get("admin/stats/reports", {
        params: { days }
    });
}

export async function getRecentActivity(limit: number = 50): Promise<any> {
    return await axiosInstance.get("admin/activity/recent", {
        params: { limit }
    });
}

export async function getSystemHealth(): Promise<any> {
    return await axiosInstance.get("admin/system/health");
}

export async function getPendingReports(page: number = 1, pageSize: number = 20): Promise<any> {
    return await axiosInstance.get("admin/reports/pending", {
        params: { page, page_size: pageSize }
    });
}

export async function cleanupExpiredSessions(): Promise<any> {
    return await axiosInstance.post("admin/maintenance/cleanup-sessions");
}

// Admin User Management APIs
export async function getUsers(page: number = 1, pageSize: number = 20, userType?: string, isActive?: boolean, search?: string): Promise<any> {
    const params: any = { page, page_size: pageSize };
    if (userType) params.user_type = userType;
    if (isActive !== undefined) params.is_active = isActive;
    if (search) params.search = search;
    
    return await axiosInstance.get("admin/users/", { params });
}

export async function getUserDetails(userId: string): Promise<any> {
    return await axiosInstance.get(`admin/users/${userId}`);
}

export async function createUser(userData: any): Promise<any> {
    return await axiosInstance.post("admin/users/", userData);
}

export async function updateUser(userId: string, userData: any): Promise<any> {
    return await axiosInstance.put(`admin/users/${userId}`, userData);
}

export async function deactivateUser(userId: string): Promise<any> {
    return await axiosInstance.delete(`admin/users/${userId}`);
}

export async function activateUser(userId: string): Promise<any> {
    return await axiosInstance.post(`admin/users/${userId}/activate`);
}

export async function getUserAuditLogs(userId: string, page: number = 1, pageSize: number = 20): Promise<any> {
    return await axiosInstance.get(`admin/users/${userId}/audit-logs`, {
        params: { page, page_size: pageSize }
    });
}

// RBAC APIs
export async function getUserRoles(userId: string): Promise<any> {
    return await axiosInstance.get(`admin/rbac/users/${userId}/roles`);
}

export async function assignUserRole(userId: string, roleName: string): Promise<any> {
    return await axiosInstance.post("admin/rbac/users/assign-role", {
        user_id: userId,
        role_name: roleName
    });
}

export async function removeUserRole(userId: string, roleName: string): Promise<any> {
    return await axiosInstance.delete(`admin/rbac/users/${userId}/roles/${roleName}`);
}

export async function getAllRoles(): Promise<any> {
    return await axiosInstance.get("admin/rbac/roles");
}

export async function createRole(roleData: any): Promise<any> {
    return await axiosInstance.post("admin/rbac/roles", roleData);
}

export async function updateRole(roleName: string, roleData: any): Promise<any> {
    return await axiosInstance.put(`admin/rbac/roles/${roleName}`, roleData);
}

export async function deleteRole(roleName: string): Promise<any> {
    return await axiosInstance.delete(`admin/rbac/roles/${roleName}`);
}

export async function getSystemConfig(): Promise<any> {
    return await axiosInstance.get("admin/config/");
}

export async function updateSystemConfig(config: any): Promise<any> {
    return await axiosInstance.put("admin/config/", config);
}

export async function getAuditLogs(params: any): Promise<any> {
    return await axiosInstance.get("admin/audit/events", { params });
}

// Health Check API
export async function healthCheck(): Promise<any> {
    return await axiosInstance.get("health");
}

// Report Submission API
export async function submitReport(doctor: string, file: number[]): Promise<any> {
    return await axiosInstance.post("submitReport", {
        doctor,
        file
    });
}

export async function getUserSimpleInfo(): Promise<any> {
    return await axiosInstance.post("user", {});
}

export async function getImagesOfReport(id: string, type: ImageType): Promise<any> {
    return await axiosInstance.post("report/images", {
        id,
        type
    });
}

export async function getImageData(id: string): Promise<any> {
    return await axiosInstance.post("image/get", {
        id
    }, {
        responseType: "blob"
    });
}

export async function getResultImageData(id: string): Promise<any> {
    return await axiosInstance.post("image/getresult_img", {
        id
    }, {
        responseType: "blob"
    });
}

// Doctor Report Management APIs
export async function createDoctorReport(patientId: string, images: string[], initialNotes?: string): Promise<any> {
    return await axiosInstance.post("doctor/reports/create", {
        patient_id: patientId,
        images,
        initial_notes: initialNotes
    });
}

export async function getDoctorReports(page: number = 1, pageSize: number = 20, status?: string, patientId?: string, dateFrom?: string, dateTo?: string): Promise<any> {
    const params: any = { page, page_size: pageSize, limit: pageSize, offset: (page - 1) * pageSize };
    if (status) params.status = status;
    if (patientId) params.patient_id = patientId;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    return await axiosInstance.post("doctor/reports/list", params);
}

export async function getDoctorReportDetail(reportId: string): Promise<any> {
    // Get token from storage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    return await axiosInstance.post("doctor/reports/detail", {
        token: token
    }, {
        params: { report_id: reportId }
    });
}

export async function updateDoctorReport(reportId: string, status?: string, diagnose?: string, notes?: string): Promise<any> {
    return await axiosInstance.post("doctor/reports/update", {
        report_id: reportId,
        status,
        diagnose,
        notes
    });
}

export async function assignReport(reportId: string, doctorId: string): Promise<any> {
    return await axiosInstance.post("doctor/reports/assign", {
        report_id: reportId,
        doctor_id: doctorId
    });
}

export async function getPendingDoctorReports(): Promise<any> {
    return await axiosInstance.post("doctor/reports/workflow/pending", {});
}

export async function completeReportDiagnosis(reportId: string, diagnose: string): Promise<any> {
    return await axiosInstance.post("doctor/reports/workflow/complete", {
        report_id: reportId,
        diagnose
    });
}

export async function getDoctorStatistics(): Promise<any> {
    return await axiosInstance.post("doctor/reports/statistics", {});
}

export async function updateDiagnosisWorkflow(reportId: string, workflowStatus: string, notes?: string, consultationRequest?: string): Promise<any> {
    return await axiosInstance.post("doctor/reports/workflow/update", {
        report_id: reportId,
        workflow_status: workflowStatus,
        notes,
        consultation_request: consultationRequest
    });
}

export async function requestConsultation(reportId: string, consultingDoctorId: string, consultationReason: string, priority: string = 'normal'): Promise<any> {
    return await axiosInstance.post("doctor/reports/consultation/request", {
        report_id: reportId,
        consulting_doctor_id: consultingDoctorId,
        consultation_reason: consultationReason,
        priority
    });
}

export async function reviewDiagnosis(reportId: string, reviewStatus: string, reviewNotes: string, suggestedChanges?: string): Promise<any> {
    return await axiosInstance.post("doctor/reports/diagnosis/review", {
        report_id: reportId,
        review_status: reviewStatus,
        review_notes: reviewNotes,
        suggested_changes: suggestedChanges
    });
}

export async function getCollaborationReports(): Promise<any> {
    return await axiosInstance.post("doctor/reports/workflow/collaboration", {});
}

// Doctor Comment System APIs
export async function createDoctorComment(reportId: string, content: string, parentId?: string, commentType: string = 'general', priority: string = 'normal', mentions: string[] = []): Promise<any> {
    return await axiosInstance.post("doctor/comments/create", {
        report_id: reportId,
        content,
        parent_id: parentId,
        comment_type: commentType,
        priority,
        mentions
    });
}

export async function getDoctorComments(reportId: string, includeDeleted: boolean = false, limit: number = 50, offset: number = 0): Promise<any> {
    // Get token from storage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    return await axiosInstance.post("doctor/comments/list", {
        token: token,
        report_id: reportId,
        include_deleted: includeDeleted,
        limit,
        offset
    });
}

export async function updateDoctorComment(commentId: string, content: string): Promise<any> {
    return await axiosInstance.post("doctor/comments/update", {
        comment_id: commentId,
        content
    });
}

export async function deleteDoctorComment(commentId: string): Promise<any> {
    return await axiosInstance.post("doctor/comments/delete", {
        comment_id: commentId
    });
}

export async function resolveDoctorComment(commentId: string, resolutionNote?: string): Promise<any> {
    return await axiosInstance.post("doctor/comments/resolve", {
        comment_id: commentId,
        resolution_note: resolutionNote
    });
}

export async function getDoctorCommentStatistics(reportId: string): Promise<any> {
    return await axiosInstance.post("doctor/comments/statistics", {}, {
        params: { report_id: reportId }
    });
}

export async function getCollaborationMentions(): Promise<any> {
    return await axiosInstance.post("doctor/comments/collaboration/mentions", {});
}

export async function getUrgentComments(): Promise<any> {
    return await axiosInstance.post("doctor/comments/collaboration/urgent", {});
}

export async function filterDoctorComments(reportId: string, commentType?: string, priority?: string, isResolved?: boolean, userId?: string, limit: number = 50, offset: number = 0): Promise<any> {
    return await axiosInstance.post("doctor/comments/filter", {
        report_id: reportId,
        comment_type: commentType,
        priority,
        is_resolved: isResolved,
        user_id: userId,
        limit,
        offset
    });
}

export async function getTeamDiscussion(reportId: string): Promise<any> {
    return await axiosInstance.post("doctor/comments/collaboration/team", {}, {
        params: { report_id: reportId }
    });
}

// Algorithm/Prediction APIs (if available)
export async function predict(doctorId: string, images: number[]): Promise<any> {
    return await axiosInstance.post("algorithm/predict", {
        doctor_id: doctorId,
        images: images
    });
}