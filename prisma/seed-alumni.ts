import { prisma } from '../src/lib/prisma';

const alumniData = [
  {
    name: "Kushagra Kaushal",
    linkedin: "https://www.linkedin.com/in/kushagra-kaushal-60280563/",
    batch: 2014,
    branch: "MBA",
    currentCompany: "Deloitte",
    designation: "Senior Consultant",
    notes: "Deloitte do offer us job roles of Data Analyst, Data Eng., Data Scientist etc., so we request you to try connecting with him so that he could help us in connecting with the talent acquisition team of Deloitte"
  },
  {
    name: "Shivam Pandey",
    linkedin: "https://www.linkedin.com/in/shivampandey88/",
    batch: 2022,
    branch: "MBA",
    currentCompany: "Deloitte",
    designation: "Assistant Manager",
    notes: "also worked at EY for past 2 Years as Business Consultant Both firms offer jobs in domain of Data analysis, data Eng. etc."
  },
  {
    name: "Manan Padsala",
    linkedin: "https://www.linkedin.com/in/mananpadsala/",
    batch: 2024,
    branch: "CSE",
    currentCompany: "Linfox",
    designation: "Business Analyst"
  },
  {
    name: "Pranshu Tewari",
    linkedin: "https://www.linkedin.com/in/pranshu-tewari7/",
    batch: 2024,
    branch: "CSE",
    currentCompany: "Linfox",
    designation: "Software Eng."
  },
  {
    name: "S S Chaubey",
    linkedin: "https://www.linkedin.com/in/sschaubey/",
    batch: 2024,
    branch: "CSE",
    currentCompany: "Amazon",
    designation: "SDE",
    notes: "previously working with Finastra"
  },
  {
    name: "Ishita Srivastava",
    linkedin: "https://www.linkedin.com/in/ishita-srivastava-b00b3b206/",
    batch: 2024,
    branch: "CSE",
    currentCompany: "Finastra",
    designation: "Associate Software eng."
  },
  {
    name: "Bhavyansh Tomar",
    linkedin: "https://www.linkedin.com/in/bhavyanshtomar/",
    batch: 2024,
    branch: "CSE",
    currentCompany: "Square Yards",
    designation: "Software Eng."
  },
  {
    name: "Akash Chauhan",
    linkedin: "https://www.linkedin.com/in/a1akashchauhan/",
    batch: 2024,
    branch: "CSE",
    currentCompany: "Newton school",
    designation: "SDE"
  },
  {
    name: "Gaurav Bhatia",
    linkedin: "https://www.linkedin.com/in/gaurav-bhatia-75574a19a/",
    batch: 2023,
    branch: "Petroleum",
    currentCompany: "Rezlytix",
    designation: "Lead AI/ML Eng.",
    email: "gaurav.bhatia@rezlytix.com"
  },
  {
    name: "Adarsh Kumar",
    linkedin: "https://www.linkedin.com/in/adarsh-kumar-236132156",
    batch: 2023,
    branch: "Petroleum",
    currentCompany: "Envyrus",
    designation: "Business analyst",
    email: "ashutosh.kumar@enverus.com"
  },
  {
    name: "Shashank Srijan",
    linkedin: "https://www.linkedin.com/in/shashank-srijan/",
    batch: 2023,
    branch: "Petroleum",
    currentCompany: "Wipro",
    designation: "Consultant",
    email: "srijan.shashank@gmail.com",
    phone: "8529467759"
  },
  {
    name: "Mohit Saraswat",
    linkedin: "https://www.linkedin.com/in/mohit-saraswat-167213195/",
    batch: 2023,
    branch: "Petroleum",
    currentCompany: "Chevron",
    designation: "Reservoir Modelling Solution Developer",
    notes: "was previously as Data Scientist and ML Eng. at Reliance and Rezlytix"
  },
  {
    name: "Aman Jindal",
    linkedin: "https://www.linkedin.com/in/aman-jindal-030398194/",
    batch: 2023,
    branch: "Chemical",
    currentCompany: "Delhivery",
    designation: "Software Engineer",
    email: "aman021jindal@gmail.com",
    notes: "was previously at flipkart"
  },
  {
    name: "Vatsal Velpula",
    linkedin: "https://www.linkedin.com/in/vatsal-velpula/",
    batch: 2018,
    branch: "Chemical",
    currentCompany: "Intel",
    designation: "Senior Process Eng."
  },
  {
    name: "Karthikeya Meruga",
    linkedin: "https://www.linkedin.com/in/karthikeya-meruga-134081153/",
    batch: 2023,
    branch: "Chemical",
    currentCompany: "JP Morgan Chase co.",
    designation: "Quant Analytics Associate"
  },
  {
    name: "Siddharth Agarwal",
    linkedin: "https://www.linkedin.com/in/siddharth-agarwal-697332203/",
    batch: 2023,
    branch: "Chemical",
    currentCompany: "American Express",
    designation: "Business Analyst"
  },
  {
    name: "Rahul",
    linkedin: "https://www.linkedin.com/in/rahul516/",
    batch: 2023,
    branch: "Chemical",
    currentCompany: "Pay Pal",
    designation: "SWE"
  }
];

async function main() {
  console.log('Start seeding alumni...');
  let count = 0;
  for (const a of alumniData) {
    // Check if exists
    const existing = await prisma.alumni.findFirst({
      where: { linkedin: a.linkedin }
    });

    if (!existing) {
      await prisma.alumni.create({
        data: a,
      });
      count++;
      console.log(`Created alumni: ${a.name}`);
    } else {
      console.log(`Alumni already exists: ${a.name}`);
    }
  }
  console.log(`Seeding finished. Inserted ${count} records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
