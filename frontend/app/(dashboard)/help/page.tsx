'use client'

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I upload resumes?",
      answer: "Navigate to the Upload page from the sidebar. You can upload PDF files by clicking the upload area or dragging and dropping files."
    },
    {
      question: "How does the AI matching work?",
      answer: "Our AI uses RAG (Retrieval Augmented Generation) technology to analyze resumes against job requirements, providing match scores based on skills, experience, and qualifications."
    },
    {
      question: "How do I create a job posting?",
      answer: "Go to the Search page (Jobs) and click 'Create Job'. Fill in the job details and requirements, then click 'Match All Resumes' to find candidates."
    },
    {
      question: "What do the match scores mean?",
      answer: "Match scores range from 0-100%. Green (70%+) indicates excellent match, yellow (40-69%) indicates good match, and red (<40%) indicates poor match."
    },
    {
      question: "Can I download matched resumes?",
      answer: "Yes, click on any matched candidate's resume to view and download it."
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">
          Help & Support
        </h1>
        <p className="text-text-light/70 dark:text-text-dark/70 mt-2">
          Frequently asked questions and guides
        </p>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark p-6">
        <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-6">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="pb-6 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-text-light dark:text-text-dark mb-2">
                {faq.question}
              </h3>
              <p className="text-text-light/70 dark:text-text-dark/70">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary/10 rounded-lg border border-primary/20 p-6">
        <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
          Need More Help?
        </h2>
        <p className="text-text-light/70 dark:text-text-dark/70 mb-4">
          Can't find what you're looking for? Contact our support team.
        </p>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  )
}
