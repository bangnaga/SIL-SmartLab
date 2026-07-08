const API_URL = 'http://localhost:3001/api';


export const api = {
    // ===== AUTH =====
    async login(email, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    // ===== USERS =====
    async getUserProfile(id) {
        const response = await fetch(`${API_URL}/users/${id}`);
        if (!response.ok) throw new Error('Failed to fetch user profile');
        return response.json();
    },

    async updateUserProfile(id, data) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    },

    // ===== USERS =====
    async getUsers() {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    async getActiveUsers() {
        const response = await fetch(`${API_URL}/users/active`);
        if (!response.ok) throw new Error('Failed to fetch active users');
        return response.json();
    },

    // ===== INVENTORY =====
    async getInventory() {
        const response = await fetch(`${API_URL}/inventory`);
        if (!response.ok) throw new Error('Failed to fetch inventory');
        return response.json();
    },

    async createInventoryItem(data) {
        const response = await fetch(`${API_URL}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create inventory item');
        }
        return response.json();
    },

    async updateInventoryItem(id, data) {
        const response = await fetch(`${API_URL}/inventory/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update inventory item');
        }
        return response.json();
    },

    async deleteInventoryItem(id) {
        const response = await fetch(`${API_URL}/inventory/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete inventory item');
        return response.json();
    },

    // ===== TRANSACTIONS =====
    async getTransactions(params = {}) {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        );
        const query = new URLSearchParams(cleanParams).toString();
        const response = await fetch(`${API_URL}/transactions${query ? `?${query}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return response.json();
    },
    async createTransaction(data) {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create transaction');
        }
        return response.json();
    },
    async approveTransaction(id) {
        const response = await fetch(`${API_URL}/transactions/${id}/approve`, {
            method: 'PUT'
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to approve transaction');
        }
        return response.json();
    },
    async rejectTransaction(id) {
        const response = await fetch(`${API_URL}/transactions/${id}/reject`, {
            method: 'PUT'
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to reject transaction');
        }
        return response.json();
    },

    // ===== ALERTS & REPORTS =====
    async getAlerts() {
        const response = await fetch(`${API_URL}/alerts`);
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return response.json();
    },
    async getReports() {
        const response = await fetch(`${API_URL}/reports`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        return response.json();
    },

    // ===== LABORATORIES (Master) =====
    async getLaboratories() {
        const response = await fetch(`${API_URL}/laboratories`);
        if (!response.ok) throw new Error('Failed to fetch laboratories');
        return response.json();
    },

    async getLaboratory(id) {
        const response = await fetch(`${API_URL}/laboratories/${id}`);
        if (!response.ok) throw new Error('Failed to fetch laboratory');
        return response.json();
    },

    async createLaboratory(data) {
        const response = await fetch(`${API_URL}/laboratories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create laboratory');
        return response.json();
    },

    async updateLaboratory(id, data) {
        const response = await fetch(`${API_URL}/laboratories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update laboratory');
        return response.json();
    },

    async deleteLaboratory(id) {
        const response = await fetch(`${API_URL}/laboratories/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete laboratory');
        return response.json();
    },

    // ===== CATEGORIES (Master) =====
    async getCategories() {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    async createCategory(data) {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create category');
        return response.json();
    },

    async updateCategory(id, data) {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update category');
        return response.json();
    },

    async deleteCategory(id) {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete category');
        return response.json();
    },
    
    // Settings API
    getSettings: async () => {
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    },
    updateSettings: async (data) => {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update settings');
        return response.json();
    },

    // ===== COURSES (Master Praktikum) =====
    async getCourses(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}/courses${query ? `?${query}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        return response.json();
    },

    async getCourse(id) {
        const response = await fetch(`${API_URL}/courses/${id}`);
        if (!response.ok) throw new Error('Failed to fetch course');
        return response.json();
    },

    async createCourse(data) {
        const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create course');
        return response.json();
    },

    async updateCourse(id, data) {
        const response = await fetch(`${API_URL}/courses/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update course');
        return response.json();
    },

    async deleteCourse(id) {
        const response = await fetch(`${API_URL}/courses/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete course');
        return response.json();
    },

    async getCourseStudents(id) {
        const response = await fetch(`${API_URL}/courses/${id}/students`);
        if (!response.ok) throw new Error('Failed to fetch course students');
        return response.json();
    },

    // ===== CLASSES (Master Kelas) =====
    async getClasses(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}/classes${query ? `?${query}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch classes');
        return response.json();
    },

    async getClass(id) {
        const response = await fetch(`${API_URL}/classes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch class');
        return response.json();
    },

    async createClass(data) {
        const response = await fetch(`${API_URL}/classes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create class');
        return response.json();
    },
    async updateClass(id, data) {
        const response = await fetch(`${API_URL}/classes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update class');
        return response.json();
    },
    async deleteClass(id) {
        const response = await fetch(`${API_URL}/classes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete class');
        }
        return response.json();
    },

    async enrollStudent(classId, studentId) {
        const response = await fetch(`${API_URL}/classes/${classId}/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to enroll student');
        }
        return response.json();
    },

    async getClassEnrollments(classId) {
        const response = await fetch(`${API_URL}/classes/${classId}/enrollments`);
        if (!response.ok) throw new Error('Failed to fetch enrollments');
        return response.json();
    },

    async updateEnrollmentStatus(enrollmentId, status, rejection_reason = null) {
        const response = await fetch(`${API_URL}/enrollments/${enrollmentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, rejection_reason }),
        });
        if (!response.ok) throw new Error('Failed to update enrollment status');
        return response.json();
    },

    async removeEnrollment(enrollmentId) {
        const response = await fetch(`${API_URL}/enrollments/${enrollmentId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove enrollment');
        return response.json();
    },

    // ===== USERS LIST =====
    async getUsers() {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    async createUser(data) {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create user');
        return response.json();
    },

    async updateUser(id, data) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    async deleteUser(id) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    },

    async uploadAvatar(id, file) {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${API_URL}/users/${id}/avatar`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload avatar');
        return response.json();
    },

    // ===== LOANS =====
    async getLoans() {
        const response = await fetch(`${API_URL}/loans`);
        if (!response.ok) throw new Error('Failed to fetch loans');
        return response.json();
    },

    async createLoan(data) {
        const response = await fetch(`${API_URL}/loans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create loan');
        return response.json();
    },

    async updateLoan(id, data) {
        const response = await fetch(`${API_URL}/loans/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update loan');
        return response.json();
    },

    // ===== WORKSHEETS =====
    async getWorksheets() {
        const response = await fetch(`${API_URL}/worksheets`);
        if (!response.ok) throw new Error('Failed to fetch worksheets');
        return response.json();
    },

    async getWorksheet(id) {
        const response = await fetch(`${API_URL}/worksheets/${id}`);
        if (!response.ok) throw new Error('Failed to fetch worksheet');
        return response.json();
    },

    async createWorksheet(data) {
        const response = await fetch(`${API_URL}/worksheets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create worksheet');
        return response.json();
    },

    async validateWorksheet(id, data) {
        const response = await fetch(`${API_URL}/worksheets/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to validate worksheet');
        return response.json();
    },

    // ===== QUIZ =====
    async getQuizList() {
        const response = await fetch(`${API_URL}/quiz/list`);
        if (!response.ok) throw new Error('Failed to fetch quiz list');
        return response.json();
    },

    async submitQuiz(data) {
        const response = await fetch(`${API_URL}/quiz/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to submit quiz');
        return response.json();
    },

    async getQuizResults(studentId) {
        const response = await fetch(`${API_URL}/quiz/results/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch quiz results');
        return response.json();
    },

    // ===== CURRICULUM =====
    async getCurriculum(courseId) {
        const response = await fetch(`${API_URL}/courses/${courseId}/curriculum`);
        if (!response.ok) throw new Error('Failed to fetch curriculum');
        return response.json();
    },

    async getStudentCurriculum(courseId, studentId) {
        const response = await fetch(`${API_URL}/student/courses/${courseId}/curriculum?studentId=${studentId}`);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch student curriculum');
        }
        return response.json();
    },

    async createTopic(courseId, data) {
        const response = await fetch(`${API_URL}/courses/${courseId}/topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create topic');
        return response.json();
    },

    async updateTopic(id, data) {
        const response = await fetch(`${API_URL}/topics/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update topic');
        return response.json();
    },

    async deleteTopic(id) {
        const response = await fetch(`${API_URL}/topics/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete topic');
        return response.json();
    },

    async reorderCurriculum(courseId, data) {
        const response = await fetch(`${API_URL}/courses/${courseId}/curriculum/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to reorder curriculum');
        return response.json();
    },

    async generateFlashcards(data) {
        const response = await fetch(`${API_URL}/ai/generate-flashcards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to generate flashcards');
        }
        return response.json();
    },

    async getClassSubmissions(classId) {
        const response = await fetch(`${API_URL}/classes/${classId}/submissions`);
        if (!response.ok) throw new Error('Failed to fetch submissions');
        return response.json();
    },

    async gradeSubmission(id, data) {
        const response = await fetch(`${API_URL}/submissions/${id}/grade`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to grade submission');
        return response.json();
    },

    async submitMaterialAssignment(materialId, data) {
        const response = await fetch(`${API_URL}/materials/${materialId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to submit material assignment');
        return response.json();
    },

    async getMaterialSubmission(materialId, studentId) {
        const response = await fetch(`${API_URL}/materials/${materialId}/submissions/${studentId}`);
        if (!response.ok) throw new Error('Failed to fetch material submission');
        return response.json();
    },

    // ===== MATERIALS =====
    async getMaterials(params = {}) {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        );
        const query = new URLSearchParams(cleanParams).toString();
        const response = await fetch(`${API_URL}/materials?${query}`);
        if (!response.ok) throw new Error('Failed to fetch materials');
        return response.json();
    },

    async createMaterial(data) {
        const response = await fetch(`${API_URL}/materials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create material');
        return response.json();
    },

    async updateMaterial(id, data) {
        const response = await fetch(`${API_URL}/materials/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update material');
        return response.json();
    },

    async deleteMaterial(id) {
        const response = await fetch(`${API_URL}/materials/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete material');
        return response.json();
    },

    // ===== CALENDAR =====
    async getCalendarEvents(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.lab_id) queryParams.append('lab_id', params.lab_id);
        if (params.academic_year) queryParams.append('academic_year', params.academic_year);
        if (params.semester) queryParams.append('semester', params.semester);
        if (params.lecturer_id) queryParams.append('lecturer_id', params.lecturer_id);
        
        const queryString = queryParams.toString();
        const url = `${API_URL}/calendar/events${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch events');
        return response.json();
    },

    async createCalendarEvent(data) {
        const response = await fetch(`${API_URL}/calendar/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to create event');
        }
        return response.json();
    },

    async updateCalendarEvent(id, data) {
        const response = await fetch(`${API_URL}/calendar/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to update event');
        }
        return response.json();
    },

    async deleteCalendarEvent(id) {
        const response = await fetch(`${API_URL}/calendar/events/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete event');
        return response.json();
    },

    async createTransaction(data) {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create transaction');
        return response.json();
    },

    // ===== LIMS REPORTS & ALERTS =====
    async getAlerts() {
        const response = await fetch(`${API_URL}/alerts`);
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return response.json();
    },

    async getReports(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}/reports${query ? '?' + query : ''}`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        return response.json();
    },

    // ===== AUDIT TRAIL =====
    async getAuditTrail() {
        const response = await fetch(`${API_URL}/audit-trail`);
        if (!response.ok) throw new Error('Failed to fetch audit trail');
        return response.json();
    },

    // ===== ANALYTICS =====
    async getAnalyticsSummary() {
        const response = await fetch(`${API_URL}/analytics/summary`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
    },

    async getStudentDashboardStats(userId) {
        const response = await fetch(`${API_URL}/dashboard/student/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return response.json();
    },

    // ===== SUPPORT =====
    async getSupportTickets() {
        const response = await fetch(`${API_URL}/support/tickets`);
        if (!response.ok) throw new Error('Failed to fetch tickets');
        return response.json();
    },

    async createSupportTicket(data) {
        const response = await fetch(`${API_URL}/support/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create ticket');
        return response.json();
    },

    // ===== AI & MACHINE LEARNING =====
    async getMLPredictions() {
        const response = await fetch(`${API_URL}/ml/predictions`);
        if (!response.ok) throw new Error('Failed to fetch ML history');
        return response.json();
    },

    async logMLPrediction(data) {
        const response = await fetch(`${API_URL}/ml/predictions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to log prediction');
        return response.json();
    },

    async generateQuizFromPDF(fileOrMaterialId, userId) {
        let response;
        if (typeof fileOrMaterialId === 'object' && fileOrMaterialId instanceof File) {
            const formData = new FormData();
            formData.append('file', fileOrMaterialId);
            if (userId) formData.append('user_id', userId);

            response = await fetch(`${API_URL}/quiz/generate`, {
                method: 'POST',
                body: formData,
            });
        } else {
            response = await fetch(`${API_URL}/quiz/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    material_id: fileOrMaterialId,
                    user_id: userId
                })
            });
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to generate quiz');
        }
        return response.json();
    },

    // ===== SYSTEM SETTINGS & QUOTA =====
    async getAISettings() {
        const response = await fetch(`${API_URL}/settings/ai`);
        if (!response.ok) throw new Error('Failed to fetch AI settings');
        return response.json();
    },

    async updateAISetting(key, value) {
        const response = await fetch(`${API_URL}/settings/ai`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value }),
        });
        if (!response.ok) throw new Error('Failed to update AI setting');
        return response.json();
    },

    async getUserQuota(userId) {
        const response = await fetch(`${API_URL}/users/${userId}/quota`);
        if (!response.ok) throw new Error('Failed to fetch quota');
        return response.json();
    },
};

export default api;
