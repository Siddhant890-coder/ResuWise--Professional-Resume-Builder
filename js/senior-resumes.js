const seniorResumes = {
  commerce: {
    keywords: ["Sales", "Finance", "Marketing", "Budgeting", "Client Management", 
              "Revenue", "Profit", "ROI", "Market Analysis", "Negotiation"],
    sections: ["Work Experience", "Certifications", "Projects", "Achievements"],
    structure: ["Header", "Experience", "Education", "Skills", "References"],
    minKeywords: 5,
    minSections: 3
  },
  science: {
    keywords: ["Research", "Lab", "Data Analysis", "Publications", "Methodology",
              "Experiments", "Hypothesis", "Peer Review", "Findings", "Statistics"],
    sections: ["Research Experience", "Publications", "Technical Skills", "Conferences"],
    structure: ["Header", "Research", "Education", "Skills", "References"],
    minKeywords: 6,
    minSections: 3
  },
  technical: {
    keywords: ["Programming", "Debugging", "Algorithms", "Frameworks", "APIs",
              "DevOps", "Cloud", "Database", "Testing", "CI/CD"],
    sections: ["Projects", "Technical Skills", "Certifications", "Open Source"],
    structure: ["Header", "Skills", "Experience", "Education"],
    minKeywords: 7,
    minSections: 3
  }
};