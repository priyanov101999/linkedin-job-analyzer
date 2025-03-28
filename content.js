// LinkedIn JD Analyzer - content script (content.js)

let currentObserver = null;

function extractJobDetails() {
  const jdTextElement = document.querySelector(".description__text") ||
                        document.querySelector(".jobs-description__container") ||
                        document.querySelector(".feed-shared-inline-show-more-text");

  if (!jdTextElement) return null;

  if (currentObserver) currentObserver.disconnect();

  currentObserver = new MutationObserver(() => {
    updateJDBox();
  });

  currentObserver.observe(jdTextElement, {
    childList: true,
    subtree: true,
    characterData: true
  });

  return extractFromElement(jdTextElement);
}

function extractFromElement(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  let fullText = "";
  while (walker.nextNode()) {
    fullText += walker.currentNode.nodeValue + " ";
  }

  const yearsRegex = /\b(\d{1,2})(\s*-\s*(\d{1,2}))?\+?\s+(years?|yrs?)\b/gi;
  const techStack = [
    // Languages
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
    // Frontend
    "React", "Angular", "Vue", "HTML", "CSS", "SASS", "Bootstrap", "Tailwind", "Next.js", "Redux",
    // Backend
    "Node", "Express", "Spring", "Flask", "Django", "FastAPI", "ASP.NET",
    // DevOps / Cloud
    "Kubernetes", "Docker", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Git", "GitHub Actions",
    // Databases
    "MySQL", "PostgreSQL", "MongoDB", "Oracle", "Redis", "SQLite", "Firebase",
    // ML/AI/Data
    "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "OpenCV", "NLP", "Pandas", "NumPy", "Matplotlib", "Seaborn",
    // Tools / Other
    "Jira", "Confluence", "Figma", "Tableau", "Power BI", "Airflow"
  ];

  const foundYears = [...fullText.matchAll(yearsRegex)].map(m => m[0]);
  const foundTech = techStack.filter(tech => fullText.toLowerCase().includes(tech.toLowerCase()));

  return {
    years: foundYears,
    tech: foundTech
  };
}

function updateJDBox() {
  const jdTextElement = document.querySelector(".description__text") ||
                        document.querySelector(".jobs-description__container") ||
                        document.querySelector(".feed-shared-inline-show-more-text");
  if (!jdTextElement) return;

  const result = extractFromElement(jdTextElement);
  let container = document.getElementById("jd-analyzer-box");
  if (!container) {
    container = document.createElement("div");
    container.id = "jd-analyzer-box";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.padding = "10px 15px";
    container.style.background = "#0073b1";
    container.style.color = "white";
    container.style.zIndex = 10000;
    container.style.borderRadius = "8px";
    container.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
    container.style.maxWidth = "300px";
    document.body.appendChild(container);
  }

  container.innerHTML = `<strong>JD Summary:</strong><br>
    <strong>Experience:</strong> ${result.years.join(", ") || "Not found"}<br>
    <strong>Tech Stack:</strong> ${result.tech.join(", ") || "Not found"}`;
}

// Watch for LinkedIn job content container switching
const pageObserver = new MutationObserver(() => {
  setTimeout(() => {
    extractJobDetails();
    updateJDBox();
  }, 1000);
});

pageObserver.observe(document.body, {
  childList: true,
  subtree: true
});

setTimeout(() => {
  extractJobDetails();
  updateJDBox();
}, 3000);
