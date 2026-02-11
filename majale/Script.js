// ==========================================================
// File: Code.gs (نسخه نهایی و تضمینی - ویرایش شده دقیق)
// ==========================================================

const AUTH_SHEET_ID = '1EMbhRCghY7x406DpfbwGHhc-gPrAMVdHZRrfkDgWj-k';
const ARTICLES_SHEET_ID = '1F_A8CWPFQjQEYF3ybVvk-ShjCn-aZGvGY2SDn8t4hhA';
const LOGS_SHEET_ID = '1NjmQPVoPZL4DpOiBQPba-ewVAYTpBh1aD-6Y8QAR6LI';
const TEMPLATE_ARTICLE_ID = '1fmNH2mC1yyznDtNm9eblq9Vlai1R5CUMvY0NPAsCvgU';

const AUTH_SHEET_NAME = 'Sheet1';
const ARTICLES_SHEET_NAME = 'Sheet1';
const LOGS_SHEET_NAME = 'Sheet1';

const authSheet = SpreadsheetApp.openById(AUTH_SHEET_ID).getSheetByName(AUTH_SHEET_NAME);
const articlesSheet = SpreadsheetApp.openById(ARTICLES_SHEET_ID).getSheetByName(ARTICLES_SHEET_NAME);
const logsSheet = SpreadsheetApp.openById(LOGS_SHEET_ID).getSheetByName(LOGS_SHEET_NAME);

// تعریف دقیق ستون‌ها بر اساس فایل اکسل (ایندکس‌ها از 0 شروع می‌شوند)
// A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10, L=11, M=12 ... AC=28
const AUTH_COLS = {
    NAME: 0,              // A: نام محقق
    NID: 1,               // B: کدملی
    PASS: 2,              // C: رمز عبور (دستور 1)
    SCORE: 3,             // D: تعداد مقالات تائید شده
    SUPERVISOR_NAME: 4,   // E: نام استاد راهنما
    SUPERVISOR_NID: 5,    // F: کدملی استاد
    SUPERVISOR_PASS: 6,   // G: رمز عبور استاد
    SUPERVISOR_REVIEWS: 7,// H: تعداد داوری‌های موفق (دستور 2)
    SUPERVISOR_LAST_LOGIN: 8, // I
    SUPERVISOR_STATUS: 9, // J: وضعیت (5 فعال)
    SUPERVISOR_ABOUT: 10, // K: درباره استاد (دستور 4)
    SUPERVISOR_CAPACITY: 11, // L
    SUPERVISOR_CONTACT: 12,  // M
    SUGGESTED_TITLE: 13,     // N
    SUGGESTED_TITLE_STATUS: 14, // O
    SUGGESTED_TITLE_ART_ID: 15, // P
    SUGGESTED_TITLE_PROP_ID: 16 // Q
    // ستون AC برای حیطه ها (ایندکس 28)
};

const ARTICLES_COLS = {
    REQUEST_DATE: 0, RESEARCHER_NAME: 1, RESEARCHER_ID: 2, AFFILIATION: 3, SUPERVISOR_NAME: 4, SUPERVISOR_ID: 5,
    SUPERVISOR_STATUS: 6, ARTICLE_ID: 7, ARTICLE_STATUS: 8, REJECTION_REASON: 9, ACCEPTANCE_DATE: 10,
    ISSUE_NUMBER: 11, KNOWLEDGE_AREA: 12, TITLE: 13, TOPIC_REASON: 14, KEYWORDS: 15, ABSTRACT: 16,
    INTRODUCTION: 17, BODY: 18, CONCLUSION: 19, REFERENCES: 20, PUBLISH_DATE: 21
};

function _logAction(researcherId, researcherName, articleId, action, details) {
    try {
        const timestamp = new Date();
        logsSheet.insertRowBefore(2);
        logsSheet.getRange("B2:D2").setNumberFormat("@");
        logsSheet.getRange("A2:F2").setValues([[timestamp, researcherId, researcherName, articleId, action, details]]);
    } catch (e) {
        Logger.log(`Failed to write to logs sheet: ${e.toString()}`);
    }
}

function _findArticleRow(articleId) {
    if (!articleId) return -1;
    const textFinder = articlesSheet.getRange("H:H").createTextFinder(String(articleId)).matchEntireCell(true);
    const foundCell = textFinder.findNext();
    return foundCell ? foundCell.getRow() : -1;
}

// تابع کمکی برای خواندن اطلاعات به‌روز استاد (دستور 2 و 4)
function _getSupervisorMap() {
    const lastRow = authSheet.getLastRow();
    if (lastRow < 2) return {};
    
    // خواندن تمام داده‌ها برای اطمینان از صحت ایندکس‌ها
    const data = authSheet.getRange(2, 1, lastRow - 1, authSheet.getLastColumn()).getValues();
    const map = {};
    
    data.forEach(row => {
        const nid = String(row[AUTH_COLS.SUPERVISOR_NID]).trim();
        if (nid) {
            // خواندن دقیق ستون H (تعداد داوری)
            let reviews = row[AUTH_COLS.SUPERVISOR_REVIEWS];
            if (reviews === "" || reviews === null || reviews === undefined) { reviews = 0; }
            
            // خواندن دقیق ستون K (درباره استاد)
            let about = row[AUTH_COLS.SUPERVISOR_ABOUT];
            if (!about) about = "توضیحاتی ثبت نشده است.";

            map[nid] = {
                reviews: reviews,
                about: about,
                contact: row[AUTH_COLS.SUPERVISOR_CONTACT] // ستون M
            };
        }
    });
    return map;
}

function _mapArticleRowToObject(row, supervisorMap) {
    const supId = String(row[ARTICLES_COLS.SUPERVISOR_ID]).trim();
    // استفاده از مپ به‌روز شده
    const supInfo = supervisorMap[supId] || {};

    return {
        supervisorStatus: row[ARTICLES_COLS.SUPERVISOR_STATUS],
        articleId: row[ARTICLES_COLS.ARTICLE_ID],
        articleStatus: row[ARTICLES_COLS.ARTICLE_STATUS],
        title: row[ARTICLES_COLS.TITLE],
        affiliation: row[ARTICLES_COLS.AFFILIATION],
        supervisorName: row[ARTICLES_COLS.SUPERVISOR_NAME],
        supervisorId: row[ARTICLES_COLS.SUPERVISOR_ID],
        
        // ارسال داده‌های دقیق و به‌روز استاد به کلاینت
        supervisorContact: supInfo.contact || '',
        supervisorReviews: supInfo.reviews || 0, // دستور 2: عدد ستون H
        supervisorAbout: supInfo.about || '',    // دستور 4: متن ستون K
        
        knowledgeArea: row[ARTICLES_COLS.KNOWLEDGE_AREA],
        topicReason: row[ARTICLES_COLS.TOPIC_REASON],
        keywords: row[ARTICLES_COLS.KEYWORDS],
        abstract: row[ARTICLES_COLS.ABSTRACT],
        introduction: row[ARTICLES_COLS.INTRODUCTION],
        body: row[ARTICLES_COLS.BODY],
        conclusion: row[ARTICLES_COLS.CONCLUSION],
        references: row[ARTICLES_COLS.REFERENCES],
        requestDate: row[ARTICLES_COLS.REQUEST_DATE],
        acceptanceDate: row[ARTICLES_COLS.ACCEPTANCE_DATE],
        issueNumber: row[ARTICLES_COLS.ISSUE_NUMBER],
        rejectionReason: row[ARTICLES_COLS.REJECTION_REASON],
        publishDate: row[ARTICLES_COLS.PUBLISH_DATE],
        researcherName: row[ARTICLES_COLS.RESEARCHER_NAME]
    };
}

function doPost(e) {
    try {
        const request = JSON.parse(e.postData.contents);
        const params = request.params || {};
        let response;
        switch (request.action) {
            case 'login': response = handleLogin(params.nationalId, params.password); break;
            case 'changePassword': response = changePassword(params.nationalId, params.oldPassword, params.newPassword); break;
            case 'getArticles': response = getArticlesForUser(params.nationalId, params.searchTerm, params.page); break;
            case 'getSingleArticle': response = getSingleArticle(params.nationalId, params.articleId); break;
            case 'getSupervisors': response = getSupervisorsList(params.searchTerm, params.page); break;
            case 'submitNewArticle': response = submitNewArticle(params.data, params.isDraft); break;
            case 'submitDraftToSupervisor': response = submitDraftToSupervisor(params.articleId, params.nationalId); break;
            case 'updateArticleSection': response = updateArticleSection(params.nationalId, params.articleId, params.section, params.content); break;
            case 'updateArticleDetails': response = updateArticleDetails(params.nationalId, params.articleId, params.details); break;
            case 'deleteArticle': response = deleteArticle(params.nationalId, params.articleId); break;
            case 'submitRevisions': response = submitRevisions(params.articleId, params.nationalId, params.revisionNotes); break;
            case 'submitFinalRevisions': response = submitFinalRevisions(params.articleId, params.nationalId, params.revisionNotes); break;
            case 'sendForFinalReview': response = sendForFinalReview(params.articleId, params.nationalId); break;
            case 'getArticleHistory': response = getArticleHistory(params.nationalId, params.articleId); break;
            case 'getSuggestedTitles': response = getSuggestedTitles(); break;
            case 'getKnowledgeAreas': response = getKnowledgeAreas(); break; // دستور 3
            case 'generateArticlePdf': response = generateArticlePdf(params.nationalId, params.articleId); break;
            default: response = { status: 'error', message: 'Action not recognized' };
        }
        return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        Logger.log("Server Error: " + error.message + " Stack: " + error.stack);
        _logAction('N/A', 'N/A', 'N/A', 'SERVER_ERROR', error.message);
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: "خطای داخلی سرور: " + error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// <<<< دستور 3: خواندن حیطه ها از ستون AC >>>>
function getKnowledgeAreas() {
    try {
        const lastRow = authSheet.getLastRow();
        if (lastRow < 2) { return { status: 'success', areas: [] }; }
        
        // ستون AC یعنی ستون 29ام.
        const data = authSheet.getRange(2, 29, lastRow - 1, 1).getValues();
        
        const areas = data.flat()
                          .map(item => String(item).trim())
                          .filter(item => item !== ""); 
                          
        return { status: 'success', areas: areas };
    } catch (e) {
        return { status: 'error', message: 'خطا در دریافت حیطه ها: ' + e.toString() };
    }
}

// <<<< دستور 1: تغییر رمز عبور با منطق دقیق بررسی ستون C >>>>
function changePassword(nationalId, oldPassword, newPassword) {
    if (!nationalId || !oldPassword || !newPassword) {
        return { status: 'error', message: 'تمام فیلدها الزامی هستند.' };
    }
    
    // خواندن کل داده‌ها برای اطمینان از تطابق دقیق
    const data = authSheet.getDataRange().getValues(); // کل شیت را می‌خواند
    
    // شروع از ردیف دوم (ایندکس 1) چون ردیف اول هدر است
    for (let i = 1; i < data.length; i++) {
        const rowNid = String(data[i][AUTH_COLS.NID]).trim(); // ستون B
        
        if (rowNid === String(nationalId).trim()) {
            const rowPass = String(data[i][AUTH_COLS.PASS]).trim(); // ستون C
            
            // بررسی رمز عبور قبلی (داده داخل فیلد اول با داده ستون C)
            if (rowPass === String(oldPassword).trim()) {
                // جایگزینی فیلد دوم (newPassword) در ستون C
                // شماره ردیف در شیت = i + 1
                // شماره ستون C = 3
                authSheet.getRange(i + 1, 3).setValue(String(newPassword).trim());
                
                _logAction(nationalId, 'N/A', 'N/A', 'PASSWORD_CHANGE', 'رمز عبور تغییر یافت.');
                return { status: 'success', message: 'رمز عبور با موفقیت تغییر کرد.' };
            } else {
                return { status: 'error', message: 'رمز عبور فعلی اشتباه است.' };
            }
        }
    }
    
    return { status: 'error', message: 'کاربر با این کدملی یافت نشد.' };
}

function generateArticlePdf(nationalId, articleId) {
    let tempDocFile;
    try {
        if (!nationalId || !articleId) { return { status: 'error', message: 'اطلاعات ناقص است.' }; }
        const rowNumber = _findArticleRow(articleId);
        if (rowNumber === -1) { return { status: 'error', message: 'مقاله یافت نشد.' }; }

        const articleRowData = articlesSheet.getRange(rowNumber, 1, 1, articlesSheet.getLastColumn()).getValues()[0];
        const ownerId = articleRowData[ARTICLES_COLS.RESEARCHER_ID];

        if (String(ownerId).trim() !== String(nationalId).trim()) {
            return { status: 'error', message: 'شما اجازه دسترسی به این مقاله را ندارید.' };
        }

        const supervisorMap = _getSupervisorMap();
        const articleData = _mapArticleRowToObject(articleRowData, supervisorMap);
        
        const formatDateForDoc = (dateString) => {
            if (!dateString) return 'نامشخص';
            try { return new Date(dateString).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }); }
            catch (e) { return dateString.toString(); }
        };

        const templateFile = DriveApp.getFileById(TEMPLATE_ARTICLE_ID);
        tempDocFile = templateFile.makeCopy(`مقاله موقت - ${articleId}`);
        const tempDoc = DocumentApp.openById(tempDocFile.getId());
        const body = tempDoc.getBody();

        body.replaceText('{{JOURNAL_NAME}}', "سالنامه علمی تبیان");
        body.replaceText('{{ISSUE_NUMBER}}', articleData.issueNumber || 'نامشخص');
        body.replaceText('{{TITLE}}', articleData.title || '');
        body.replaceText('{{RESEARCHER_NAME}}', articleData.researcherName || '');
        body.replaceText('{{RESEARCHER_AFFILIATION}}', articleData.affiliation || '');
        body.replaceText('{{SUPERVISOR_NAME}}', articleData.supervisorName || '');
        body.replaceText('{{ACCEPTANCE_DATE}}', formatDateForDoc(articleData.acceptanceDate));
        body.replaceText('{{PUBLISH_DATE}}', formatDateForDoc(articleData.publishDate));
        body.replaceText('{{ABSTRACT}}', articleData.abstract || 'موجود نیست');
        body.replaceText('{{KEYWORDS}}', articleData.keywords || 'موجود نیست');
        body.replaceText('{{INTRODUCTION}}', articleData.introduction || 'موجود نیست');
        body.replaceText('{{BODY}}', articleData.body || 'موجود نیست');
        body.replaceText('{{CONCLUSION}}', articleData.conclusion || 'موجود نیست');
        body.replaceText('{{REFERENCES}}', articleData.references || 'موجود نیست');

        tempDoc.saveAndClose();
        const pdfBlob = tempDocFile.getAs('application/pdf');
        const pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());
        const filename = `مقاله - ${articleData.title}.pdf`;

        return { status: 'success', data: { filename: filename, mimeType: 'application/pdf', content: pdfBase64 } };
    } catch (error) {
        Logger.log("generateArticlePdf Error: " + error.toString());
        return { status: 'error', message: 'خطا در هنگام ساخت PDF: ' + error.toString() };
    } finally {
        if (tempDocFile) { try { DriveApp.getFileById(tempDocFile.getId()).setTrashed(true); } catch (e) { Logger.log("Failed to delete temp file: " + e.toString()); } }
    }
}

function getSingleArticle(nationalId, articleId) {
    if (!nationalId || !articleId) { return { status: 'error', message: 'اطلاعات ناقص است.' }; }
    const rowNumber = _findArticleRow(articleId);
    if (rowNumber === -1) { return { status: 'error', message: 'مقاله یافت نشد.' }; }
    const articleRowData = articlesSheet.getRange(rowNumber, 1, 1, articlesSheet.getLastColumn()).getValues()[0];
    const ownerId = articleRowData[ARTICLES_COLS.RESEARCHER_ID];

    if (String(ownerId).trim() !== String(nationalId).trim()) {
        return { status: 'error', message: 'شما اجازه دسترسی به این مقاله را ندارید.' };
    }

    const supervisorMap = _getSupervisorMap();
    const articleObject = _mapArticleRowToObject(articleRowData, supervisorMap);
    return { status: 'success', article: articleObject };
}

function getSuggestedTitles() {
    try {
        const lastRow = authSheet.getLastRow();
        if (lastRow < 2) { return { status: 'success', titles: [] }; }
        const allData = authSheet.getRange(2, 1, lastRow - 1, authSheet.getLastColumn()).getValues();
        
        const availableTitles = allData.map(row => {
            const title = row[AUTH_COLS.SUGGESTED_TITLE];
            const status = row[AUTH_COLS.SUGGESTED_TITLE_STATUS];
            const proposerName = row[AUTH_COLS.SUPERVISOR_NAME]; 

            if (title && String(status).trim() !== '5') {
                return {
                    title: title,
                    proposerName: proposerName || 'نامشخص'
                };
            }
            return null;
        }).filter(Boolean);
        return { status: 'success', titles: availableTitles };
    } catch (error) {
        Logger.log("Error in getSuggestedTitles: " + error.toString());
        return { status: 'error', message: 'خطا در دریافت عناوین پیشنهادی.' };
    }
}

function getSupervisorsList(searchTerm = '', page = 1) {
    try {
        const PAGE_SIZE = 7;
        const articlesData = articlesSheet.getRange("F2:G" + articlesSheet.getLastRow()).getValues();
        const activeArticleStatuses = new Set(['1', '6', '8']);
        const supervisorLoad = articlesData.reduce((acc, row) => {
            const supervisorId = row[0];
            const supervisorStatus = String(row[1]);
            if (supervisorId && activeArticleStatuses.has(supervisorStatus)) {
                acc[supervisorId] = (acc[supervisorId] || 0) + 1;
            }
            return acc;
        }, {});

        const authLastRow = authSheet.getLastRow();
        if (authLastRow < 2) return { status: 'success', supervisors: [], hasMore: false };
        const supervisorsData = authSheet.getRange(2, 1, authLastRow - 1, authSheet.getLastColumn()).getValues();
        const allSupervisors = [];
        const seenNids = new Set();
        
        for (const row of supervisorsData) {
            const name = String(row[AUTH_COLS.SUPERVISOR_NAME] || '').trim();
            const nid = String(row[AUTH_COLS.SUPERVISOR_NID] || '').trim();
            
            if (name && nid && !seenNids.has(nid)) {
                const statusVal = String(row[AUTH_COLS.SUPERVISOR_STATUS]).trim();
                const isActive = statusVal === '5'; 
                
                const capacity = parseInt(row[AUTH_COLS.SUPERVISOR_CAPACITY]) || 0;
                const currentLoad = supervisorLoad[nid] || 0;
                
                // دستور 2: ستون H
                let reviews = row[AUTH_COLS.SUPERVISOR_REVIEWS];
                if (reviews === "" || reviews === null || reviews === undefined) { reviews = 0; }
                
                // دستور 4: ستون K
                let about = row[AUTH_COLS.SUPERVISOR_ABOUT];
                if (!about) about = "";
                
                allSupervisors.push({
                    name: name, 
                    nationalId: nid, 
                    isActive: isActive,
                    description: String(about).trim(),
                    successfulReviews: reviews,
                    contact: String(row[AUTH_COLS.SUPERVISOR_CONTACT] || '').trim(),
                    isFull: currentLoad >= capacity
                });
                seenNids.add(nid);
            }
        }
        
        let filteredSupervisors = allSupervisors;
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase().trim();
            filteredSupervisors = allSupervisors.filter(s =>
                s.name.toLowerCase().includes(lowerCaseSearch) || s.nationalId.includes(lowerCaseSearch)
            );
        }
        
        const startIndex = (page - 1) * PAGE_SIZE;
        const paginatedSupervisors = filteredSupervisors.slice(startIndex, startIndex + PAGE_SIZE);
        const hasMore = (startIndex + PAGE_SIZE) < filteredSupervisors.length;
        return { status: 'success', supervisors: paginatedSupervisors, hasMore: hasMore };
    } catch (error) {
        Logger.log("Error in getSupervisorsList: " + error.toString());
        return { status: 'error', message: 'خطا در دریافت لیست اساتید.' };
    }
}

function getArticlesForUser(nationalId, searchTerm = '', page = 1) {
    try {
        const PAGE_SIZE = 5;
        const allArticlesData = articlesSheet.getDataRange().getValues().slice(1);
        let userArticlesRows = allArticlesData.filter(row => row[ARTICLES_COLS.RESEARCHER_ID] && row[ARTICLES_COLS.RESEARCHER_ID].toString().trim() === nationalId.trim());

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase().trim();
            userArticlesRows = userArticlesRows.filter(row => {
                const title = (row[ARTICLES_COLS.TITLE] || '').toLowerCase();
                const supervisor = (row[ARTICLES_COLS.SUPERVISOR_NAME] || '').toLowerCase();
                const keywords = (row[ARTICLES_COLS.KEYWORDS] || '').toLowerCase();
                return title.includes(lowerCaseSearch) || supervisor.includes(lowerCaseSearch) || keywords.includes(lowerCaseSearch);
            });
        }
        
        userArticlesRows.sort((a, b) => (b[ARTICLES_COLS.ARTICLE_ID] || 0) - (a[ARTICLES_COLS.ARTICLE_ID] || 0));

        const startIndex = (page - 1) * PAGE_SIZE;
        const paginatedRows = userArticlesRows.slice(startIndex, startIndex + PAGE_SIZE);
        const hasMore = (startIndex + PAGE_SIZE) < userArticlesRows.length;

        // دریافت اطلاعات به‌روز اساتید برای اتصال به آبجکت مقالات
        const supervisorMap = _getSupervisorMap();
        const articles = paginatedRows.map(row => _mapArticleRowToObject(row, supervisorMap));

        let score = 0;
        try {
            const textFinder = authSheet.getRange("B:B").createTextFinder(String(nationalId)).matchEntireCell(true);
            const foundCell = textFinder.findNext();
            if (foundCell) { 
                score = authSheet.getRange(foundCell.getRow(), AUTH_COLS.SCORE + 1).getValue() || 0; 
            }
        } catch (e) { Logger.log("Could not retrieve score for user " + nationalId + ": " + e.toString()); }

        return { status: 'success', articles: articles, hasMore: hasMore, score: score };
    } catch (error) {
        Logger.log("Error in getArticlesForUser: " + error.toString());
        return { status: 'error', message: 'خطا در بارگذاری مقالات.' };
    }
}

function submitNewArticle(data, isDraft = false) {
    try {
        if (!data.title) return { status: 'error', message: 'عنوان مقاله الزامی است.' };
        if (!isDraft && !data.supervisor) return { status: 'error', message: 'انتخاب استاد راهنما برای ارسال نهایی الزامی است.' };
        
        const articleIdColumn = ARTICLES_COLS.ARTICLE_ID + 1;
        const lastRow = articlesSheet.getLastRow();
        let maxId = 100000;
        if (lastRow > 1) {
            const allIds = articlesSheet.getRange(2, articleIdColumn, lastRow - 1, 1).getValues()
                .flat().map(id => parseInt(id)).filter(id => !isNaN(id));
            if (allIds.length > 0) { maxId = Math.max(...allIds); }
        }
        const newArticleId = maxId + 1;
        const today = new Date();

        const newRow = Array(Object.keys(ARTICLES_COLS).length + 1).fill('');
        newRow[ARTICLES_COLS.REQUEST_DATE] = today;
        newRow[ARTICLES_COLS.RESEARCHER_NAME] = data.researcherName;
        newRow[ARTICLES_COLS.RESEARCHER_ID] = data.researcherId;
        newRow[ARTICLES_COLS.AFFILIATION] = data.affiliation;
        newRow[ARTICLES_COLS.SUPERVISOR_NAME] = data.supervisor ? data.supervisor.name : '';
        newRow[ARTICLES_COLS.SUPERVISOR_ID] = data.supervisor ? data.supervisor.nationalId : '';
        newRow[ARTICLES_COLS.SUPERVISOR_STATUS] = isDraft ? 9 : 1; 
        newRow[ARTICLES_COLS.ARTICLE_ID] = newArticleId;
        newRow[ARTICLES_COLS.ARTICLE_STATUS] = isDraft ? 9 : 1; 
        newRow[ARTICLES_COLS.KNOWLEDGE_AREA] = data.knowledgeArea;
        newRow[ARTICLES_COLS.TITLE] = data.title;
        newRow[ARTICLES_COLS.TOPIC_REASON] = data.topicReason;

        articlesSheet.getRange(articlesSheet.getLastRow() + 1, 1, 1, newRow.length).setNumberFormat("@").setValues([newRow]);
        
        try {
            const titleFinder = authSheet.getRange("N:N").createTextFinder(data.title).matchEntireCell(true);
            const foundTitleCell = titleFinder.findNext();
            if (foundTitleCell) {
                const row = foundTitleCell.getRow();
                authSheet.getRange(row, 15).setValue(5); 
                authSheet.getRange(row, 16).setValue(newArticleId); 
                _logAction(data.researcherId, data.researcherName, newArticleId, 'SUGGESTED_TITLE_TAKEN', `Title: ${data.title}`);
            }
        } catch (e) { Logger.log("Could not update suggested title status: " + e.toString()); }

        const logAction = isDraft ? 'SAVE_DRAFT_SUCCESS' : 'SUBMIT_ARTICLE_SUCCESS';
        const message = isDraft ? 'مقاله با موفقیت به عنوان پیش‌نویس ذخیره شد.' : 'مقاله با موفقیت برای استاد راهنما ارسال شد.';
        _logAction(data.researcherId, data.researcherName, newArticleId, logAction, `عنوان: ${data.title}`);
        return { status: 'success', message: message };
    } catch (error) {
        _logAction(data.researcherId || 'N/A', data.researcherName || 'N/A', 'N/A', 'SUBMIT_ARTICLE_ERROR', error.toString());
        Logger.log("Error in submitNewArticle: " + error.toString());
        return { status: 'error', message: 'خطا در ثبت مقاله: ' + error.toString() };
    }
}

function submitDraftToSupervisor(articleId, nationalId) {
    if (!articleId || !nationalId) return { status: 'error', message: 'اطلاعات ناقص است.' };
    const rowNumber = _findArticleRow(articleId);
    if (rowNumber === -1) return { status: 'error', message: 'مقاله یافت نشد.' };
    const articleData = articlesSheet.getRange(rowNumber, 1, 1, articlesSheet.getLastColumn()).getValues()[0];
    const ownerId = articleData[ARTICLES_COLS.RESEARCHER_ID];
    const currentStatus = articleData[ARTICLES_COLS.ARTICLE_STATUS];
    const supervisorId = articleData[ARTICLES_COLS.SUPERVISOR_ID];
    const researcherName = articleData[ARTICLES_COLS.RESEARCHER_NAME];
    if (ownerId.toString().trim() !== nationalId.trim()) {
        return { status: 'error', message: 'شما اجازه دسترسی به این مقاله را ندارید.' };
    }
    if (String(currentStatus) !== '9') {
        return { status: 'error', message: 'این مقاله یک پیش‌نویس نیست.' };
    }
    if (!supervisorId) {
        return { status: 'error', message: 'لطفا ابتدا یک استاد راهنما برای مقاله انتخاب کنید.' };
    }
    try {
        articlesSheet.getRange(rowNumber, ARTICLES_COLS.ARTICLE_STATUS + 1).setValue(1);
        articlesSheet.getRange(rowNumber, ARTICLES_COLS.SUPERVISOR_STATUS + 1).setValue(1);
        _logAction(nationalId, researcherName, articleId, 'SUBMIT_DRAFT_SUCCESS', 'پیش‌نویس برای استاد راهنما ارسال شد.');
        return { status: 'success', message: 'مقاله با موفقیت برای استاد راهنما ارسال شد.' };
    } catch (error) {
        _logAction(nationalId, researcherName, articleId, 'SUBMIT_DRAFT_ERROR', error.toString());
        return { status: 'error', message: 'خطا در ارسال مقاله: ' + error.toString() };
    }
}

function handleLogin(nationalId, password) {
    if (!nationalId || !password) return { status: 'error', message: 'کدملی و رمز عبور الزامی است.' };
    const data = authSheet.getRange(2, 1, authSheet.getLastRow(), 4).getValues();
    for (let i = 0; i < data.length; i++) {
        if (data[i][AUTH_COLS.NID] && data[i][AUTH_COLS.PASS] && data[i][AUTH_COLS.NID].toString().trim() === nationalId.trim() && data[i][AUTH_COLS.PASS].toString().trim() === password.trim()) {
            const score = data[i][AUTH_COLS.SCORE] || 0;
            _logAction(nationalId, data[i][AUTH_COLS.NAME], 'N/A', 'LOGIN_SUCCESS', 'ورود موفق به سیستم');
            return { status: 'success', user: { name: data[i][AUTH_COLS.NAME], nationalId: data[i][AUTH_COLS.NID].toString().trim(), score: score } };
        }
    }
    return { status: 'error', message: 'کدملی یا رمز عبور اشتباه است.' };
}

function getArticleHistory(nationalId, articleId) {
    if (!nationalId || !articleId) { return { status: 'error', message: 'اطلاعات ناقص است.' }; }
    const rowNumber = _findArticleRow(articleId);
    if (rowNumber !== -1) {
        const ownerId = articlesSheet.getRange(rowNumber, ARTICLES_COLS.RESEARCHER_ID + 1).getValue();
        if (ownerId.toString().trim() !== nationalId.trim()) {
            return { status: 'error', message: 'شما اجازه مشاهده تاریخچه این مقاله را ندارید.' };
        }
    }
    try {
        const logData = logsSheet.getDataRange().getValues();
        const history = [];
        for (let i = 1; i < logData.length; i++) {
            if (String(logData[i][3]).trim() === String(articleId).trim()) {
                history.push({ timestamp: logData[i][0], action: logData[i][4], details: logData[i][5] });
            }
        }
        return { status: 'success', history: history };
    } catch (error) {
        return { status: 'error', message: 'خطا در خواندن تاریخچه وقایع.' };
    }
}

function submitFinalRevisions(articleId, nationalId, revisionNotes) {
    // ... (کد قبلی بدون تغییر)
    if (!articleId || !nationalId || !revisionNotes) { return { status: 'error', message: 'اطلاعات لازم ارسال نشده است.' }; }
    const rowNumber = _findArticleRow(articleId);
    if (rowNumber === -1) { return { status: 'error', message: 'مقاله یافت نشد.' }; }
    const articleInfo = articlesSheet.getRange(rowNumber, 1, 1, articlesSheet.getLastColumn()).getValues()[0];
    const ownerId = articleInfo[ARTICLES_COLS.RESEARCHER_ID];
    const currentStatus = articleInfo[ARTICLES_COLS.ARTICLE_STATUS];
    const originalReason = articleInfo[ARTICLES_COLS.REJECTION_REASON];

    if (ownerId.toString().trim() !== nationalId.trim()) return { status: 'error', message: 'شما اجازه دسترسی به این مقاله را ندارید.' };
    if (String(currentStatus) != '10') return { status: 'error', message: 'این مقاله در وضعیت "نیازمند ویرایش نهایی" قرار ندارد.' };

    try {
        const combinedNotes = `توضیحات رد از طرف نشریه: ${originalReason}\nویرایش های جدید محقق: ${revisionNotes}`;
        articlesSheet.getRange(rowNumber, ARTICLES_COLS.ARTICLE_STATUS + 1).setValue(12); 
        articlesSheet.getRange(rowNumber, ARTICLES_COLS.REJECTION_REASON + 1).setValue(combinedNotes); 
        return { status: 'success', message: 'ویرایشات نهایی شما با موفقیت برای بررسی مجدد ارسال شد.' };
    } catch (error) {
        return { status: 'error', message: 'خطا در ارسال ویرایشات نهایی: ' + error.toString() };
    }
}

function submitRevisions(articleId, nationalId, revisionNotes) {
    if (!articleId || !nationalId || !revisionNotes) { return { status: 'error', message: 'اطلاعات لازم ارسال نشده است.' }; }
    const rowNumber = _findArticleRow(articleId);
    if (rowNumber === -1) { return { status: 'error', message: 'مقاله یافت نشد.' }; }
    
    const articleInfo = articlesSheet.getRange(rowNumber, 1, 1, articlesSheet.getLastColumn()).getValues()[0];
    const ownerId = articleInfo[ARTICLES_COLS.RESEARCHER_ID];
    const currentStatus = articleInfo[ARTICLES_COLS.ARTICLE_STATUS];
    const originalReason = articleInfo[ARTICLES_COLS.REJECTION_REASON];

    if (ownerId.toString().trim() !== nationalId.trim()) return { status: 'error', message: 'شما اجازه دسترسی به این مقاله را ندارید.' };
    if (String(currentStatus) != '2') return { status: 'error', message: 'این مقاله در وضعیت "نیازمند ویرایش" قرار ندارد.' };

    try {
        const combinedNotes = `درخواست استاد: ${originalReason.split('توضیحات محقق:')[0].replace('درخواست استاد:', '').trim()}\nتوضیحات محقق: ${revisionNotes}`;
        articlesSheet.getRange(rowNumber, ARTICLES_COLS.ARTICLE_STATUS + 1).setValue(12); 
        articlesSheet.getRange(rowNumber, ARTICLES_COLS.REJECTION_REASON + 1).setValue(combinedNotes); 
        return { status: 'success', message: 'ویرایشات شما با موفقیت برای بررسی مجدد ارسال شد.' };
    } catch (error) {
        return { status: 'error', message: 'خطا در ارسال ویرایشات: ' + error.toString() };
    }
}

function deleteArticle(nationalId, articleId) {
    // ... (همان کد قبلی)
    if (!nationalId || !articleId) return { status: 'error', message: 'اطلاعات لازم برای حذف ارسال نشده است.' };
    const rowNumber = _findArticleRow(articleId);
    if (rowNumber === -1) return { status: 'error', message: 'مقاله مورد نظر یافت نشد.' };
    const articleRowData = articlesSheet.getRange(rowNumber, 1, 1, articlesSheet.getLastColumn()).getValues()[0];
    const ownerId = articleRowData[ARTICLES_COLS.RESEARCHER_ID];
    const supervisorStatus = articleRowData[ARTICLES_COLS.SUPERVISOR_STATUS];
    const articleStatus = articleRowData[ARTICLES_COLS.ARTICLE_STATUS];
    if (ownerId.toString().trim() !== nationalId.trim()) return { status: 'error', message: 'شما اجازه حذف این مقاله را ندارید.' };
    if (supervisorStatus == 5 && articleStatus != 9) return { status: 'error', message: 'امکان حذف مقاله پس از تایید استاد راهنما وجود ندارد.' };
    articlesSheet.deleteRow(rowNumber);
    return { status: 'success', message: 'مقاله و سوابق مربوطه با موفقیت حذف شدند.' };
}

function sendForFinalReview(articleId, nationalId) {
    // ... (همان کد قبلی)
    if (!articleId || !nationalId) return { status: 'error', message: 'اطلاعات ناقص است.' };
    const rowNumber = _findArticleRow(articleId);
    if (rowNumber === -1) return { status: 'error', message: 'مقاله یافت نشد.' };
    const articleData = articlesSheet.getRange(rowNumber, 1, 1, articlesSheet.getLastColumn()).getValues()[0];
    const ownerId = articleData[ARTICLES_COLS.RESEARCHER_ID];
    const supervisorStatus = articleData[ARTICLES_COLS.SUPERVISOR_STATUS];
    if (ownerId.toString().trim() !== nationalId.trim()) return { status: 'error', message: 'شما اجازه دسترسی به این مقاله را ندارید.' };
    if (String(supervisorStatus) !== '5') return { status: 'error', message: 'این عمل تنها پس از تایید استاد راهنما امکان‌پذیر است.' };
    try {
      articlesSheet.getRange(rowNumber, ARTICLES_COLS.ARTICLE_STATUS + 1).setValue(11);
      return { status: 'success', message: 'مقاله با موفقیت برای بررسی نهایی ارسال شد و پس از این قابل ویرایش نخواهد بود.' };
    } catch (error) {
      return { status: 'error', message: 'خطا در ارسال مقاله: ' + error.toString() };
    }
}

function updateArticleDetails(nationalId, articleId, details) {
    // ... (همان کد قبلی)
    if (!nationalId) return { status: 'error', message: 'احراز هویت ناموفق.' };
    const rowNumber = _findArticleRow(articleId);
    if (rowNumber === -1) return { status: 'error', message: 'مقاله یافت نشد.' };
    const articleInfo = articlesSheet.getRange(rowNumber, 1, 1, articlesSheet.getLastColumn()).getValues()[0];
    const ownerId = articleInfo[ARTICLES_COLS.RESEARCHER_ID];
    if (ownerId.toString().trim() !== nationalId.trim()) return { status: 'error', message: 'شما اجازه ویرایش این مقاله را ندارید.' };

    if (details.title && details.title.trim() !== '') articlesSheet.getRange(rowNumber, ARTICLES_COLS.TITLE + 1).setValue(details.title.trim());
    if (details.supervisor) {
        articlesSheet.getRange(rowNumber, ARTICLES_COLS.SUPERVISOR_NAME + 1).setValue(details.supervisor.name);
        articlesSheet.getRange(rowNumber, ARTICLES_COLS.SUPERVISOR_ID + 1).setValue(details.supervisor.nationalId);
    }
    if (details.affiliation) articlesSheet.getRange(rowNumber, ARTICLES_COLS.AFFILIATION + 1).setValue(details.affiliation);
    if (details.knowledgeArea) articlesSheet.getRange(rowNumber, ARTICLES_COLS.KNOWLEDGE_AREA + 1).setValue(details.knowledgeArea);
    if (details.topicReason) articlesSheet.getRange(rowNumber, ARTICLES_COLS.TOPIC_REASON + 1).setValue(details.topicReason);
    return { status: 'success', message: 'اطلاعات مقاله با موفقیت به‌روزرسانی شد.' };
}

function updateArticleSection(nationalId, articleId, section, content) {
    // ... (همان کد قبلی)
    if (!nationalId) return { status: 'error', message: 'احراز هویت ناموفق.' };
    const rowNumber = _findArticleRow(articleId);
    if (rowNumber === -1) return { status: 'error', message: 'مقاله یافت نشد.' };
    const articleInfo = articlesSheet.getRange(rowNumber, ARTICLES_COLS.RESEARCHER_NAME + 1, 1, 2).getValues()[0];
    const ownerId = articleInfo[1];
    if (ownerId.toString().trim() !== nationalId.trim()) return { status: 'error', message: 'شما اجازه ویرایش این مقاله را ندارید.' };
    switch (section) {
        case 'keywords_abstract': articlesSheet.getRange(rowNumber, ARTICLES_COLS.KEYWORDS + 1, 1, 2).setValues([[content.keywords, content.abstract]]); break;
        case 'introduction': articlesSheet.getRange(rowNumber, ARTICLES_COLS.INTRODUCTION + 1).setValue(content); break;
        case 'body': articlesSheet.getRange(rowNumber, ARTICLES_COLS.BODY + 1).setValue(content); break;
        case 'conclusion': articlesSheet.getRange(rowNumber, ARTICLES_COLS.CONCLUSION + 1).setValue(content); break;
        case 'references': articlesSheet.getRange(rowNumber, ARTICLES_COLS.REFERENCES + 1).setValue(content); break;
        default: return { status: 'error', message: 'بخش نامعتبر است.' };
    }
    return { status: 'success', message: 'بخش مورد نظر با موفقیت ذخیره شد.' };
}

// ==========================================================
// File: Script.js (نسخه نهایی - اصلاح شده برای حل مشکل Loading و نمایش صحیح اطلاعات استاد)
// ==========================================================

// --- Configurations ---
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwTgJU4lbocweggC0zU7XyzzWKg3BhcUcFc5kaeYoD6dsAHVN7A-15L19G32UCa2hB/exec';

// --- State Management ---
let allUserArticles = [];
let currentPage = 1;
let currentSearchTerm = '';
let isLoading = false;
let hasMoreArticles = true;
let currentFilter = 'all';
// متغیر سراسری برای نگهداری حیطه ها
let globalKnowledgeAreas = [];

// --- DOM Elements ---
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const modalContainer = document.getElementById('modal-container');
const toastContainer = document.getElementById('toast-container');

function generateSkeletonHTML(count = 3) {
    let html = '';
    for(let i=0; i<count; i++) {
        html += `
        <div class="article-card" style="border-right-color: #e2e8f0;">
            <div class="skeleton skeleton-text" style="width: 60%; height: 20px;"></div>
            <div class="skeleton skeleton-text" style="width: 30%; height: 14px; margin-top: 8px;"></div>
            <div class="card-separator-strip"></div>
        </div>`;
    }
    return html;
}

async function callApi(action, params = {}, button = null) {
    if (button) button.classList.add('btn-loading');
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action, params })
        });
        if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Call Failed:', error);
        return { status: 'error', message: error.message, isNetworkError: true };
    } finally {
        if (button) button.classList.remove('btn-loading');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const user = getStoredUser();
    const body = document.body;
    if (user) {
        loginPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        body.classList.remove('login-view');
        showDashboard(user);
    } else {
            loginPage.classList.remove('hidden');
            dashboardPage.classList.add('hidden');
            body.classList.add('login-view');
    }

    document.addEventListener('click', function (event) {
        const menu = document.getElementById('user-menu-dropdown');
        const menuBtn = document.getElementById('user-menu-btn');
        if (menu && menuBtn && !menu.contains(event.target) && !menuBtn.contains(event.target)) {
            menu.classList.add('hidden');
        }
    });
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginError = document.getElementById('login-error');
    loginError.textContent = '';
    const btn = document.getElementById('login-btn');
    
    const response = await callApi('login', {
        nationalId: document.getElementById('national-id').value,
        password: document.getElementById('password').value
    }, btn);
    
    if (response?.status === 'success') {
        storeUser(response.user);
        loginPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        document.body.classList.remove('login-view');
        showDashboard(response.user);
        showToast(`خوش آمدید، ${response.user.name}`, 'success');
    } else {
        loginError.textContent = response?.isNetworkError ? 'خطا در ارتباط با سرور' : response?.message || 'خطایی رخ داد.';
        showToast('ورود ناموفق', 'error');
    }
});

function showDashboard(user) {
    document.getElementById('header-greeting').textContent = `سلام، ${user.name}`;
    document.getElementById('menu-user-name').textContent = user.name;
    document.getElementById('menu-user-nid').textContent = user.nationalId;
    document.getElementById('menu-user-score').textContent = user.score || 0; 
    
    // فراخوانی حیطه ها بلافاصله بعد از لود داشبورد
    fetchKnowledgeAreas();

    document.getElementById('user-menu-btn').onclick = () => {
        document.getElementById('user-menu-dropdown').classList.toggle('hidden');
    };
    
    document.getElementById('change-pass-btn').onclick = () => {
        showChangePasswordModal();
    };

    document.getElementById('refresh-btn').onclick = () => {
        const icon = document.querySelector('#refresh-btn i');
        icon.classList.add('fa-spin');
        loadArticles(user.nationalId, false).then(() => {
            icon.classList.remove('fa-spin');
            showToast('لیست بروزرسانی شد', 'info');
        });
    };

    document.getElementById('logout-btn').onclick = handleLogout;
    document.getElementById('add-new-article-btn').onclick = showNewArticleModal;

    document.getElementById('article-tabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-item')) {
            const filter = e.target.dataset.statusFilter;
            if (filter === currentFilter) return;
            currentFilter = filter;
            document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');
            renderArticles(); 
        }
    });

    let searchDebounce;
    const searchInput = document.getElementById('article-search-input');
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            currentSearchTerm = e.target.value.trim();
            loadArticles(user.nationalId, false);
        }, 500);
    });
    loadArticles(user.nationalId, false);
}

// تابع جدید برای دریافت و ذخیره حیطه ها
async function fetchKnowledgeAreas() {
    try {
        const response = await callApi('getKnowledgeAreas');
        if (response?.status === 'success') {
            globalKnowledgeAreas = response.areas;
        }
    } catch (e) { console.error('Failed to load knowledge areas', e); }
}

function showChangePasswordModal() {
    const modalContent = `
        <div class="modal-body">
            <div class="form-group">
                <label>رمز عبور قبلی</label>
                <input type="password" id="old-pass" required>
            </div>
            <div class="form-group">
                <label>رمز عبور جدید</label>
                <input type="password" id="new-pass" required>
            </div>
        </div>
        <div class="modal-footer">
            <button id="do-change-pass-btn" class="btn-primary" style="width:100%">تغییر رمز</button>
        </div>
    `;
    renderModal('تغییر رمز عبور', modalContent, 'modal-sm');
    
    document.getElementById('do-change-pass-btn').onclick = async (e) => {
        const oldPass = document.getElementById('old-pass').value;
        const newPass = document.getElementById('new-pass').value;
        if(!oldPass || !newPass) return showToast('لطفا همه فیلدها را پر کنید', 'error');
        
        const user = getStoredUser();
        const res = await callApi('changePassword', { nationalId: user.nationalId, oldPassword: oldPass, newPassword: newPass }, e.target);
        
        if (res?.status === 'success') {
            showToast('رمز عبور تغییر کرد', 'success');
            closeModalById('main-modal');
        } else {
            showToast(res.message || 'خطا در تغییر رمز', 'error');
        }
    };
}

function showSupervisorDetailsModal(details, name) {
    const modalContent = `
        <div class="modal-body" style="text-align: right; line-height: 1.8;">
            <div style="margin-bottom: 15px;">
                <strong>نام استاد:</strong> <span>${name}</span>
            </div>
            <div style="margin-bottom: 15px; background: #f0f9ff; padding: 10px; border-radius: 8px;">
                <strong><i class="fas fa-check-circle" style="color:var(--success);"></i> تعداد داوری‌های موفق:</strong> 
                <span style="font-size: 1.1rem; font-weight: bold;">${details.supervisorReviews || 0}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong><i class="fas fa-envelope"></i> اطلاعات تماس:</strong><br>
                <span>${details.supervisorContact || 'ثبت نشده'}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong><i class="fas fa-info-circle"></i> درباره استاد:</strong><br>
                <p style="white-space: pre-wrap; color: var(--text-muted);">${details.supervisorAbout || 'توضیحاتی ثبت نشده است.'}</p>
            </div>
        </div>
        <div class="modal-footer">
            <button onclick="closeModalById('sub-modal')" class="btn-secondary">بستن</button>
        </div>
    `;
    renderModal('مشخصات استاد راهنما', modalContent, 'modal-sm', true);
}

async function loadArticles(nationalId, isLoadMore = false) {
    if (isLoading) return;
    isLoading = true;

    const loadMoreContainer = document.getElementById('load-more-container');
    const articlesContainer = document.getElementById('articles-container');

    if (!isLoadMore) {
        currentPage = 1;
        allUserArticles = [];
        hasMoreArticles = true;
        articlesContainer.innerHTML = generateSkeletonHTML(4);
        const loadingSpinner = '<i class="fas fa-spinner fa-spin" style="font-size:1.2rem;"></i>';
        document.getElementById('stat-inprogress-count').innerHTML = loadingSpinner;
        document.getElementById('stat-accepted-count').innerHTML = loadingSpinner;
        document.getElementById('stat-rejected-count').innerHTML = loadingSpinner;
    } else {
        if (loadMoreContainer.querySelector('button')) {
            loadMoreContainer.querySelector('button').classList.add('btn-loading');
        }
    }

    const response = await callApi('getArticles', {
        nationalId,
        searchTerm: currentSearchTerm,
        page: currentPage
    });

    if (isLoadMore && loadMoreContainer.querySelector('button')) {
        loadMoreContainer.querySelector('button').classList.remove('btn-loading');
    }

    if (response?.status === 'success') {
        allUserArticles.push(...response.articles);
        hasMoreArticles = response.hasMore;
        currentPage++;

        renderArticles();
        updateSummaryDashboard(response.summary || allUserArticles);
        
        if (!isLoadMore) {
            document.getElementById('menu-user-score').textContent = response.score;
            const user = getStoredUser();
            if (user) { user.score = response.score; storeUser(user); }
        }
    } else {
        if (!isLoadMore) {
            articlesContainer.innerHTML = '<p style="color:var(--danger); text-align: center; margin-top:30px;">خطا در بارگذاری مقالات</p>';
             document.getElementById('stat-inprogress-count').innerHTML = '-';
             document.getElementById('stat-accepted-count').innerHTML = '-';
             document.getElementById('stat-rejected-count').innerHTML = '-';
        }
        if (response.isNetworkError) {
            showToast('خطا در ارتباط با سرور', 'error');
        }
    }
    isLoading = false;
}

function updateSummaryDashboard(data) {
    let inProgress, accepted, rejected;

    if (Array.isArray(data)) {
        inProgress = data.filter(a => ![0, 5, 9, 10, '0', '5', '9', '10'].includes(a.articleStatus)).length;
        accepted = data.filter(a => String(a.articleStatus) === '5').length;
        rejected = data.filter(a => ['0', '10'].includes(String(a.articleStatus))).length;
    } else {
        inProgress = data.inProgress;
        accepted = data.accepted;
        rejected = data.rejected;
    }
    
    document.getElementById('stat-inprogress-count').textContent = inProgress;
    document.getElementById('stat-accepted-count').textContent = accepted;
    document.getElementById('stat-rejected-count').textContent = rejected;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function showCustomConfirm(message, onConfirm, confirmText = 'بله', cancelText = 'خیر') {
    const alertContainer = document.getElementById('alert-container');
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.background = 'rgba(0,0,0,0.5)'; overlay.style.zIndex = '2000'; overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.backdropFilter = 'blur(5px)';
    
    overlay.innerHTML = `
        <div class="modal-box" style="max-width: 400px; text-align: center; padding: 30px;">
            <i class="fas fa-question-circle custom-alert-icon warning" style="color:var(--warning)"></i>
            <p style="margin-bottom:25px; font-size:1.1rem; line-height: 1.6;">${message}</p>
            <div style="display:flex; gap:10px; justify-content:center;">
                <button id="confirm-yes-btn" class="btn-primary" style="min-width:100px;">${confirmText}</button>
                <button id="confirm-no-btn" class="btn-secondary" style="min-width:100px;">${cancelText}</button>
            </div>
        </div>`;
    
    alertContainer.appendChild(overlay);
    
    const confirmBtn = overlay.querySelector('#confirm-yes-btn');
    const cancelBtn = overlay.querySelector('#confirm-no-btn');
    
    const closeModal = () => { overlay.remove(); };
    
    confirmBtn.onclick = () => { 
        confirmBtn.classList.add('btn-loading'); 
        onConfirm(true, confirmBtn, closeModal); 
    };
    cancelBtn.onclick = () => { 
        onConfirm(false, null, closeModal); 
    };
}

async function handleDeleteArticle(articleId, button) {
    showCustomConfirm('آیا از حذف این مقاله اطمینان دارید؟ تمام سوابق آن پاک خواهد شد.', async (confirmed, confirmBtn, closeModal) => {
        if (confirmed) {
            const user = getStoredUser();
            const response = await callApi('deleteArticle', { articleId: articleId, nationalId: user.nationalId });
            closeModal();
            if (response?.status === 'success') {
                showToast('مقاله با موفقیت حذف شد', 'success');
                loadArticles(user.nationalId, false);
            } else {
                showToast(response?.message || 'خطا در حذف مقاله', 'error');
            }
        } else { closeModal(); }
    }, 'حذف شود', 'لغو');
}

async function handleNewArticleSubmit(e, isDraft) {
    if (!isDraft && !window.selectedSupervisor) {
        return showToast('لطفاً استاد راهنما را انتخاب کنید.', 'error');
    }
    const user = getStoredUser();
    const data = {
        researcherName: user.name,
        researcherId: user.nationalId,
        title: document.getElementById('new-article-title').value,
        affiliation: [document.getElementById('aff-level').value, document.getElementById('aff-field').value, document.getElementById('aff-institute').value, document.getElementById('aff-location').value].filter(Boolean).join('، '),
        knowledgeArea: document.getElementById('new-knowledge-area').value,
        topicReason: document.getElementById('new-topic-reason').value,
        supervisor: isDraft ? null : window.selectedSupervisor
    };
    
    const response = await callApi('submitNewArticle', { data, isDraft }, e.target);
    
    if (response?.status === 'success') {
        showToast(isDraft ? 'پیش‌نویس ذخیره شد' : 'مقاله با موفقیت ثبت شد', 'success');
        closeAllModals();
        await loadArticles(user.nationalId, false);
    } else {
        showToast(response?.message || 'خطا در ثبت', 'error');
    }
}

async function updateCardInPlace(articleId) {
    const card = document.querySelector(`.article-card[data-article-id="${articleId}"]`);
    if (!card) return;
    const statusContainer = card.querySelector('.status-badges');
    if (statusContainer) { statusContainer.innerHTML = '<div class="btn-loading" style="color:var(--primary); height:20px;"></div>'; }

    const user = getStoredUser();
    const response = await callApi('getSingleArticle', { nationalId: user.nationalId, articleId });

    if (response?.status === 'success' && response.article) {
        const newArticleData = response.article;
        const articleIndex = allUserArticles.findIndex(a => a.articleId == articleId);
        if (articleIndex > -1) { allUserArticles[articleIndex] = newArticleData; }
        
        card.innerHTML = generateArticleCardInnerHTML(newArticleData);
        card.style.borderRightColor = getCardBorderColor(newArticleData);
        bindArticleCardEvents(card, newArticleData);
    }
}

function showEditArticleWizard(article) {
    const isFullyLocked = [5, 6, 8, 11].includes(Number(article.articleStatus));
    const isReadOnly = isFullyLocked;
    const isDraft = Number(article.articleStatus) === 9;
    
    const countWords = (str) => str ? str.trim().split(/\s+/).filter(Boolean).length : 0;
    const countKeywords = (str) => str ? str.trim().split(/[,،]/).filter(s => s.trim() !== "").length : 0;
    
    const referenceManagerHTML = `
        <div class="form-group"><label for="ref-type">نوع منبع</label><select id="ref-type" ${isReadOnly ? 'disabled' : ''}><option value="book">کتاب</option><option value="journal">مقاله مجله</option><option value="website">وب‌سایت</option></select></div>
        <div id="ref-book-fields"><div class="ref-manager-grid"><div class="form-group"><label>نام خانوادگی</label><input id="ref-book-lname" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>نام نویسنده</label><input id="ref-book-fname" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>سال نشر</label><input id="ref-book-year" type="number" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>عنوان کتاب</label><input id="ref-book-title" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>انتشارات</label><input id="ref-book-publisher" ${isReadOnly ? 'disabled' : ''}></div></div></div>
        <div id="ref-journal-fields" class="hidden"><div class="ref-manager-grid"><div class="form-group"><label>نام خانوادگی</label><input id="ref-journal-lname" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>نام نویسنده</label><input id="ref-journal-fname" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>سال نشر</label><input id="ref-journal-year" type="number" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>عنوان مقاله</label><input id="ref-journal-title" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>نام مجله</label><input id="ref-journal-name" ${isReadOnly ? 'disabled' : ''}></div></div></div>
        <div id="ref-website-fields" class="hidden"><div class="ref-manager-grid"><div class="form-group"><label>نویسنده</label><input id="ref-web-author" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>سال</label><input id="ref-web-year" type="number" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>عنوان صفحه</label><input id="ref-web-title" ${isReadOnly ? 'disabled' : ''}></div><div class="form-group"><label>URL</label><input id="ref-web-url" type="url" ${isReadOnly ? 'disabled' : ''}></div></div></div>
        <button id="add-ref-btn" class="btn-secondary" style="width:100%; margin-bottom:10px;" type="button" ${isReadOnly ? 'disabled' : ''}><i class="fas fa-plus"></i> افزودن به لیست</button>
        <div class="validation-note"><span>حداقل ۵ منبع</span><span id="ref-counter" class="counter"></span></div>
        <ul class="reference-list" id="reference-list-container"></ul>
        <textarea id="edit-references-hidden" class="hidden">${article.references || ''}</textarea>
        <button class="save-section-btn btn-success" type="button" data-section="references" style="width:100%; margin-top:10px;" ${isReadOnly ? 'disabled' : ''}>ذخیره منابع</button>
    `;

    const modalContent = `
    <div class="split-editor-container">
        <!-- Sidebar -->
        <div class="editor-sidebar">
            <h4 style="display:none;">بخش‌ها</h4>
            <button class="sidebar-nav-btn active" data-target="sec-details">1. اطلاعات کلی</button>
            <button class="sidebar-nav-btn" data-target="sec-abstract">2. چکیده و کلیدواژه</button>
            <button class="sidebar-nav-btn" data-target="sec-intro">3. مقدمه</button>
            <button class="sidebar-nav-btn" data-target="sec-body">4. بدنه اصلی</button>
            <button class="sidebar-nav-btn" data-target="sec-conclusion">5. نتیجه‌گیری</button>
            <button class="sidebar-nav-btn" data-target="sec-refs">6. منابع</button>
        </div>
        
        <!-- Content -->
        <div class="editor-content" id="editor-content-area">
            <div id="sec-details" class="editor-section" data-index="0">
                <!-- Details injected via JS -->
            </div>

            <div id="sec-abstract" class="editor-section hidden" data-index="1">
                <div class="form-group">
                    <label>چکیده</label>
                    <textarea id="edit-abstract" rows="6" ${isReadOnly ? 'disabled' : ''}>${article.abstract || ''}</textarea>
                    <div class="validation-note"><span id="abstract-counter" class="counter">0</span> کلمه</div>
                </div>
                <div class="form-group">
                    <label>کلیدواژه‌ها</label>
                    <input type="text" id="edit-keywords" value="${article.keywords || ''}" ${isReadOnly ? 'disabled' : ''}>
                    <div class="validation-note"><span id="keywords-counter" class="counter">0</span> مورد</div>
                </div>
                <button class="save-section-btn btn-success" type="button" data-section="keywords_abstract" style="width:100%" ${isReadOnly ? 'disabled' : ''}>ذخیره</button>
            </div>

            <div id="sec-intro" class="editor-section hidden" data-index="2">
                <div class="form-group">
                    <label>مقدمه</label>
                    <textarea id="edit-introduction" rows="12" ${isReadOnly ? 'disabled' : ''}>${article.introduction || ''}</textarea>
                    <div class="validation-note"><span id="intro-counter" class="counter">0</span> کلمه</div>
                </div>
                <button class="save-section-btn btn-success" type="button" data-section="introduction" style="width:100%" ${isReadOnly ? 'disabled' : ''}>ذخیره</button>
            </div>

            <div id="sec-body" class="editor-section hidden" data-index="3">
                <div class="form-group">
                    <label>بدنه اصلی</label>
                    <textarea id="edit-body" rows="18" ${isReadOnly ? 'disabled' : ''}>${article.body || ''}</textarea>
                    <div class="validation-note"><span id="body-counter" class="counter">0</span> کلمه</div>
                </div>
                <button class="save-section-btn btn-success" type="button" data-section="body" style="width:100%" ${isReadOnly ? 'disabled' : ''}>ذخیره</button>
            </div>

            <div id="sec-conclusion" class="editor-section hidden" data-index="4">
                <div class="form-group">
                    <label>نتیجه‌گیری</label>
                    <textarea id="edit-conclusion" rows="8" ${isReadOnly ? 'disabled' : ''}>${article.conclusion || ''}</textarea>
                    <div class="validation-note"><span id="conclusion-counter" class="counter">0</span> کلمه</div>
                </div>
                <button class="save-section-btn btn-success" type="button" data-section="conclusion" style="width:100%" ${isReadOnly ? 'disabled' : ''}>ذخیره</button>
            </div>

            <div id="sec-refs" class="editor-section hidden" data-index="5">
                ${referenceManagerHTML}
            </div>
        </div>
    </div>
    ${isDraft ? `<div class="modal-footer"><button id="submit-draft-btn" class="btn-info" type="button" style="width:100%"><i class="fas fa-paper-plane"></i> <span class="btn-text">ارسال نهایی پیش‌نویس برای استاد</span></button></div>` : ''}
    `;
    
    renderModal(`${article.title}`, modalContent, 'modal-lg');
    
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.dataset.target;
            const targetEl = document.getElementById(targetId);
            if(targetEl) {
                document.querySelectorAll('.editor-section').forEach(section => {
                    section.classList.add('hidden');
                });
                targetEl.classList.remove('hidden');
                document.querySelectorAll('.sidebar-nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        };
    });

    if (isDraft) {
        document.getElementById('submit-draft-btn').onclick = (e) => handleSubmitDraft(e, article.articleId, article.supervisorName);
    }

    if (!isDraft && [0, 1].includes(Number(article.supervisorStatus))) {
        const step1Container = document.getElementById('sec-details');
        const notice = document.createElement('div');
        notice.className = 'editor-feedback-notice rejected';
        notice.style.marginBottom = '20px';
        notice.innerHTML = '<strong>توجه:</strong> تا زمان تایید استاد راهنما، امکان ویرایش بخش‌های دیگر مقاله وجود ندارد.';
        if (Number(article.supervisorStatus) === 0) {
            notice.innerHTML = '<strong>درخواست رد شد:</strong> استاد راهنما درخواست شما را نپذیرفته است. لطفاً از این بخش، استاد راهنمای دیگری انتخاب کنید.';
        }
        step1Container.prepend(notice);
    }
    
    const setupCounter = (inputId, counterId, min, max, isKeyword = false) => {
        const input = document.getElementById(inputId);
        const counter = document.getElementById(counterId);
        const update = () => {
            const count = isKeyword ? countKeywords(input.value) : countWords(input.value);
            counter.textContent = count;
            counter.classList.toggle('invalid', !isReadOnly && (count < min || count > max));
        };
        input.addEventListener('input', update);
        update();
    };
    setupCounter('edit-abstract', 'abstract-counter', 150, 300);
    setupCounter('edit-keywords', 'keywords-counter', 3, 5, true);
    setupCounter('edit-introduction', 'intro-counter', 350, 500);
    setupCounter('edit-body', 'body-counter', 700, 3000);
    setupCounter('edit-conclusion', 'conclusion-counter', 100, 500);

    document.querySelectorAll('.save-section-btn').forEach(btn => {
        btn.onclick = async (e) => {
            if (isReadOnly) return;
            const user = getStoredUser();
            const section = e.target.closest('button').dataset.section;
            let content;
            
            if (section === 'keywords_abstract') {
                const abstractText = document.getElementById('edit-abstract').value;
                const keywordsText = document.getElementById('edit-keywords').value;
                if (countWords(abstractText) < 150 || countWords(abstractText) > 300) return showToast('تعداد کلمات چکیده معتبر نیست (۱۵۰ تا ۳۰۰)', 'error');
                if (countKeywords(keywordsText) < 3 || countKeywords(keywordsText) > 5) return showToast('تعداد کلیدواژه‌ها معتبر نیست (۳ تا ۵)', 'error');
                content = { keywords: keywordsText, abstract: abstractText };
            } else if (section === 'references') {
                content = document.getElementById('edit-references-hidden').value;
                if (document.getElementById('reference-list-container').children.length < 5) return showToast('حداقل ۵ منبع الزامی است', 'error');
            } else {
                const text = document.getElementById(`edit-${section}`).value;
                const wordCount = countWords(text);
                if (section === 'introduction' && (wordCount < 350 || wordCount > 500)) return showToast('تعداد کلمات مقدمه معتبر نیست', 'error');
                if (section === 'body' && (wordCount < 700 || wordCount > 3000)) return showToast('تعداد کلمات بدنه معتبر نیست', 'error');
                if (section === 'conclusion' && (wordCount < 100 || wordCount > 500)) return showToast('تعداد کلمات نتیجه‌گیری معتبر نیست', 'error');
                content = text;
            }

            const res = await callApi('updateArticleSection', { nationalId: user.nationalId, articleId: article.articleId, section, content }, e.target);
            if (res?.status === 'success') {
                showToast('ذخیره شد', 'success');
                updateCardInPlace(article.articleId);
            } else {
                showToast(res.message || 'خطا در ذخیره', 'error');
            }
        };
    });

    const refTypeSelect = document.getElementById('ref-type');
    const fields = { book: document.getElementById('ref-book-fields'), journal: document.getElementById('ref-journal-fields'), website: document.getElementById('ref-website-fields') };
    const addRefBtn = document.getElementById('add-ref-btn');
    const refListContainer = document.getElementById('reference-list-container');
    const hiddenRefTextarea = document.getElementById('edit-references-hidden');
    const refCounter = document.getElementById('ref-counter');
    
    const updateRefList = () => {
        const items = Array.from(refListContainer.children).map(li => li.querySelector('span').textContent);
        hiddenRefTextarea.value = items.join('\n');
        const count = items.length;
        refCounter.textContent = count;
        refCounter.classList.toggle('invalid', !isReadOnly && (count < 5));
    };

    const renderInitialRefs = () => {
        refListContainer.innerHTML = '';
        hiddenRefTextarea.value.split('\n').filter(Boolean).forEach(refText => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${refText}</span><button class="icon-btn-circle" style="width:24px;height:24px;min-height:auto;border:none;background:transparent;color:var(--danger);" type="button"><i class="fas fa-times"></i></button>`;
            if (!isReadOnly) { li.querySelector('button').onclick = () => { li.remove(); updateRefList(); }; }
            refListContainer.appendChild(li);
        });
        updateRefList();
    };

    refTypeSelect.onchange = () => Object.keys(fields).forEach(key => fields[key].classList.toggle('hidden', refTypeSelect.value !== key));
    
    addRefBtn.onclick = () => {
        if (isReadOnly) return;
        let formattedRef = '', inputsToClear = [];
        if (refTypeSelect.value === 'book') {
            const vals = ['ref-book-lname', 'ref-book-fname', 'ref-book-year', 'ref-book-title', 'ref-book-publisher'].map(id => document.getElementById(id).value.trim());
            if (vals.some(v => !v)) return showToast('تمام فیلدها الزامی است', 'error');
            formattedRef = `${vals[0]}، ${vals[1]} (${vals[2]}). *${vals[3]}*. ${vals[4]}.`;
            inputsToClear = ['ref-book-lname', 'ref-book-fname', 'ref-book-year', 'ref-book-title', 'ref-book-publisher'];
        } else if (refTypeSelect.value === 'journal') {
            const vals = ['ref-journal-lname', 'ref-journal-fname', 'ref-journal-year', 'ref-journal-title', 'ref-journal-name'].map(id => document.getElementById(id).value.trim());
            if (vals.some(v => !v)) return showToast('تمام فیلدها الزامی است', 'error');
            formattedRef = `${vals[0]}، ${vals[1]} (${vals[2]}). "${vals[3]}". *${vals[4]}*.`;
            inputsToClear = ['ref-journal-lname', 'ref-journal-fname', 'ref-journal-year', 'ref-journal-title', 'ref-journal-name'];
        } else {
            const vals = ['ref-web-author', 'ref-web-year', 'ref-web-title', 'ref-web-url'].map(id => document.getElementById(id).value.trim());
            if (!vals[1] || !vals[2] || !vals[3]) return showToast('سال، عنوان و URL الزامی است', 'error');
            formattedRef = `${vals[0] ? vals[0] + ' ' : ''}(${vals[1]}). *${vals[2]}*. بازیابی: ${vals[3]}`;
            inputsToClear = ['ref-web-author', 'ref-web-year', 'ref-web-title', 'ref-web-url'];
        }
        const li = document.createElement('li');
        li.innerHTML = `<span>${formattedRef}</span><button class="icon-btn-circle" style="width:24px;height:24px;min-height:auto;border:none;background:transparent;color:var(--danger);" type="button"><i class="fas fa-times"></i></button>`;
        li.querySelector('button').onclick = () => { li.remove(); updateRefList(); };
        refListContainer.appendChild(li);
        updateRefList();
        inputsToClear.forEach(id => document.getElementById(id).value = '');
    };
    renderInitialRefs();

    const canChangeSupervisor = (article.supervisorStatus != 5) || (article.articleStatus == 4) || isDraft;
    const step1 = document.getElementById('sec-details');
    step1.innerHTML = `
        <div class="form-group">
            <label>عنوان مقاله</label>
            <input type="text" id="edit-article-title" value="${article.title || ''}" ${isFullyLocked ? 'disabled' : ''}>
        </div>
        <div class="form-group">
            <label>حیطه دانشی</label>
            <select id="edit-knowledgeArea" ${isReadOnly ? 'disabled' : ''}>${getKnowledgeAreaOptions(article.knowledgeArea)}</select>
        </div>
        <div class="form-group">
            <label>دلیل انتخاب موضوع</label>
            <textarea id="edit-topicReason" rows="3" ${isReadOnly ? 'disabled' : ''}>${article.topicReason || ''}</textarea>
        </div>
        <div class="form-group">
            <label>وابستگی سازمانی (جهت ویرایش کلیک کنید)</label>
            <input type="text" id="edit-affiliation-display" value="${article.affiliation || ''}" readonly style="cursor:pointer;" onclick="if(!${isReadOnly}) document.getElementById('aff-trigger-btn').click()">
            <button id="aff-trigger-btn" class="hidden"></button>
        </div>
        <div class="form-group">
            <label>استاد راهنما</label>
            <div style="display:flex; gap:10px;">
                <input type="text" id="edit-supervisor-display" value="${article.supervisorName || 'انتخاب نشده'}" disabled>
                ${canChangeSupervisor && !isReadOnly ? '<button id="change-supervisor-btn" class="btn-secondary" type="button">تغییر</button>' : ''}
            </div>
        </div>
        <button id="save-details-btn" class="save-section-btn btn-success" type="button" style="width:100%" ${isReadOnly ? 'disabled' : ''}>ذخیره اطلاعات کلی</button>
    `;

    document.getElementById('aff-trigger-btn').onclick = () => {
        showAffiliationModal(null, document.getElementById('edit-affiliation-display').value, (newVal) => {
            document.getElementById('edit-affiliation-display').value = newVal;
        });
    };

    if (document.getElementById('change-supervisor-btn')) {
        document.getElementById('change-supervisor-btn').onclick = () => {
            showSupervisorModal(null, (s) => {
                window.selectedSupervisorForEdit = s;
                document.getElementById('edit-supervisor-display').value = s.name;
            });
        };
    }

    document.getElementById('save-details-btn').onclick = async (e) => {
        if (isReadOnly) return;
        const user = getStoredUser();
        const details = {
            title: document.getElementById('edit-article-title').value,
            affiliation: document.getElementById('edit-affiliation-display').value,
            knowledgeArea: document.getElementById('edit-knowledgeArea').value,
            topicReason: document.getElementById('edit-topicReason').value
        };
        if (canChangeSupervisor && window.selectedSupervisorForEdit) {
            details.supervisor = window.selectedSupervisorForEdit;
        }
        
        const res = await callApi('updateArticleDetails', { nationalId: user.nationalId, articleId: article.articleId, details }, e.target);
        if (res?.status === 'success') {
            showToast('اطلاعات کلی بروزرسانی شد', 'success');
            updateCardInPlace(article.articleId);
            window.selectedSupervisorForEdit = null;
            if (isDraft) {
                const updated = await callApi('getSingleArticle', { nationalId: user.nationalId, articleId: article.articleId });
                if (updated?.article) { closeModalById('main-modal'); showEditArticleWizard(updated.article); }
            }
        } else {
            showToast(res.message || 'خطا در ذخیره', 'error');
        }
    };
}

// <<<< اصلاح تابع تولید آپشن های حیطه برای مدیریت Loading >>>>
function getKnowledgeAreaOptions(sel) {
    if (!globalKnowledgeAreas || globalKnowledgeAreas.length === 0) {
        return `<option value="">در حال دریافت حیطه ها...</option>`;
    }
    return globalKnowledgeAreas.map(a => `<option value="${a}" ${sel === a ? 'selected' : ''}>${a}</option>`).join('');
}

function handleLogout() { localStorage.removeItem('currentUser'); window.location.reload(); }
function storeUser(u) { localStorage.setItem('currentUser', JSON.stringify(u)); }
function getStoredUser() { try { return JSON.parse(localStorage.getItem('currentUser')); } catch(e){ return null; } }

function renderModal(title, content, sizeClass = '', isSub = false) {
    const id = isSub ? 'sub-modal' : 'main-modal';
    const existing = document.getElementById(id);
    if(existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = id; overlay.className = 'modal-overlay';
    if (isSub) overlay.style.zIndex = '1100'; 
    
    overlay.innerHTML = `
        <div class="modal-box ${sizeClass}">
            <div class="modal-header"><h3>${title}</h3><button class="modal-close-btn"><i class="fas fa-times"></i></button></div>
            ${content}
        </div>`;
    
    modalContainer.appendChild(overlay);
    setTimeout(() => overlay.classList.add('visible'), 10);
    overlay.querySelector('.modal-close-btn').onclick = () => overlay.remove();
}

function closeModalById(id) { const m = document.getElementById(id); if(m) m.remove(); }
function closeAllModals() { modalContainer.innerHTML = ''; }

function getStatusInfo(type, code) {
    const map = { '0': ['رد شده', '#ef4444'], '1': ['بررسی اولیه', '#f59e0b'], '2': ['نیاز به اصلاح', '#f59e0b'], '4': ['انصراف استاد', '#64748b'], '5': ['پذیرش نهایی', '#10b981'], '9': ['پیش‌نویس', '#94a3b8'], '10': ['اصلاح نهایی', '#ef4444'], '11': ['داوری نهایی', '#3b82f6'] };
    return map[String(code)] || ['در جریان', '#3b82f6'];
}