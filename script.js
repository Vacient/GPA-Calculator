//Grade Point mapping
const gradeToPoint = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.67,
  'B+': 3.33,
  'B': 3.0,
  'B-': 2.67,
  'C+': 2.33,
  'C': 2.0,
  'D': 1.0,
  'F': 0.0,
  'ABS/NA': 0.0
};

// marks range
function getGradeRange(grade) {
  const ranges = {
    'A+': '≥ 90',
    'A': '80-89',
    'A-': '75-79',
    'B+': '70-74',
    'B': '65-69',
    'B-': '60-64',
    'C+': '55-59',
    'C': '50-54',
    'D': '40-49',
    'F': '< 40',
    'ABS/NA': 'Absent / NA'
  };
  return ranges[grade] || '—';
}

// Course model: { id, name, grade }
let courses = [];
let nextId = 1;

// DOM elements
const coursesContainer = document.getElementById('coursesContainer');
const gpaValueDisplay = document.getElementById('gpaValueDisplay');
const courseCountDisplay = document.getElementById('courseCountDisplay');
const totalPointsDisplay = document.getElementById('totalPointsDisplay');

// Compute GPA based on simple average of grade points (each course weight = 1)
function computeGPA() {
  if (courses.length === 0) {
    return { gpa: 0, totalPoints: 0, courseCount: 0 };
  }
  let sumPoints = 0;
  for (const course of courses) {
    const point = gradeToPoint[course.grade] !== undefined ? gradeToPoint[course.grade] : 0;
    sumPoints += point;
  }
  const gpa = sumPoints / courses.length;
  return {
    gpa: parseFloat(gpa.toFixed(4)),
    totalPoints: parseFloat(sumPoints.toFixed(2)),
    courseCount: courses.length
  };
}

// Update the display with latest GPA results
function updateGpaDisplay() {
  const { gpa, totalPoints, courseCount } = computeGPA();
  gpaValueDisplay.innerText = gpa.toFixed(4);
  totalPointsDisplay.innerText = totalPoints.toFixed(2);
  courseCountDisplay.innerText = courseCount;
}

// Helper to escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Generate grade options dropdown HTML
function generateGradeOptions(selectedGrade) {
  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F', 'ABS/NA'];
  let options = '';
  for (let g of grades) {
    const selectedAttr = (selectedGrade === g) ? 'selected' : '';
    const point = gradeToPoint[g];
    options += `<option value="${g}" ${selectedAttr}>${g} (${point} pts)</option>`;
  }
  return options;
}

// Render all courses
function renderCourses() {
  if (!coursesContainer) return;
  
  if (courses.length === 0) {
    coursesContainer.innerHTML = `
      <div style="text-align:center; padding: 2rem; background: #f5f7fb; border-radius: 1.2rem; color: #566b82;">
        No courses added yet.<br>Click "Add Course" to start.
      </div>
    `;
    updateGpaDisplay();
    return;
  }

  let html = '';
  for (const course of courses) {
    const gradePoint = gradeToPoint[course.grade] !== undefined ? gradeToPoint[course.grade] : 0;
    const marksRange = getGradeRange(course.grade);
    
    html += `
      <div class="course-row" data-id="${course.id}">
        <div class="course-name">
          <input type="text" class="course-name-input" value="${escapeHtml(course.name)}" placeholder="Course name" autocomplete="off">
        </div>
        <div class="grade-select">
          <select class="grade-select-input">
            ${generateGradeOptions(course.grade)}
          </select>
        </div>
        <div class="preview-point">
          ${gradePoint.toFixed(2)} pts<br>
          <span class="preview-range">${marksRange}</span>
        </div>
        <button class="remove-course" data-id="${course.id}">Delete</button>
      </div>
    `;
  }
  coursesContainer.innerHTML = html;

  for (const course of courses) {
    const row = document.querySelector(`.course-row[data-id='${course.id}']`);
    if (!row) continue;

    const nameInput = row.querySelector('.course-name-input');
    const gradeSelect = row.querySelector('.grade-select-input');
    const removeBtn = row.querySelector('.remove-course');
    const previewDiv = row.querySelector('.preview-point');

    // Name change handler
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        course.name = e.target.value;
      });
    }

    // Grade change handler - update preview immediately
    if (gradeSelect) {
      gradeSelect.addEventListener('change', (e) => {
        const newGrade = e.target.value;
        course.grade = newGrade;
        const newPoint = gradeToPoint[newGrade] !== undefined ? gradeToPoint[newGrade] : 0;
        const newRange = getGradeRange(newGrade);
        if (previewDiv) {
          previewDiv.innerHTML = `${newPoint.toFixed(2)} pts<br><span class="preview-range">${newRange}</span>`;
        }
      });
    }

    // Remove button handler
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        courses = courses.filter(c => c.id !== course.id);
        renderCourses();
        updateGpaDisplay();
      });
    }
  }
  
  // Update GPA display after render (courses list changed)
  updateGpaDisplay();
}

// Add a new course
function addCourse() {
  const newId = nextId++;
  const defaultGrade = 'B';  // B = 3.0 points as default
  courses.push({
    id: newId,
    name: `Course ${courses.length + 1}`,
    grade: defaultGrade
  });
  renderCourses();
}

// Reset all courses
function resetCourses() {
  courses = [];
  nextId = 1;
  renderCourses();
}

// Load exactly 6 example courses with grades A+, B, C, D, E, F
function loadSixExample() {
  courses = [];
  nextId = 1;
  const exampleNames = ['Mathematics', 'Physics', 'Computer Science', 'Economics', 'English', 'Biology'];
  const exampleGrades = ['A+', 'B', 'C+', 'D', 'A', 'F'];
  for (let i = 0; i < 6; i++) {
    courses.push({
      id: nextId++,
      name: exampleNames[i],
      grade: exampleGrades[i]
    });
  }
  renderCourses();
  updateGpaDisplay();
}

// Calculate GPA and show result (also updates display)
function calculateGpaAndShow() {
  const { gpa, totalPoints, courseCount } = computeGPA();
  gpaValueDisplay.innerText = gpa.toFixed(4);
  totalPointsDisplay.innerText = totalPoints.toFixed(2);
  courseCountDisplay.innerText = courseCount;
  
  // Add subtle visual feedback
  const resultArea = document.querySelector('.result-area');
  if (resultArea) {
    resultArea.style.transform = 'scale(1.01)';
    setTimeout(() => {
      if (resultArea) resultArea.style.transform = '';
    }, 200);
  }
}

// Event listeners for buttons
document.getElementById('calculateGpaBtn')?.addEventListener('click', calculateGpaAndShow);
document.getElementById('addCourseBtn')?.addEventListener('click', addCourse);
document.getElementById('resetCoursesBtn')?.addEventListener('click', resetCourses);
document.getElementById('exampleSixBtn')?.addEventListener('click', loadSixExample);

// Initialize with 3 default courses
function initDefault() {
  courses = [];
  nextId = 1;
  courses.push({ id: nextId++, name: 'Mathematics', grade: 'B+' });
  courses.push({ id: nextId++, name: 'English', grade: 'A' });
  courses.push({ id: nextId++, name: 'Science', grade: 'C' });
  renderCourses();
}

initDefault();
