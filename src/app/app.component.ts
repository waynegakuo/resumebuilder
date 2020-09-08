import { Resume, Experience, Education, Skill } from './models/resume.model';
import { Component } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'resumebuilder';

  resume = new Resume();
  degrees = ['B.E.', 'M.E.', 'B.Com', 'M.Com'];

  constructor() {
    this.resume = JSON.parse(sessionStorage.getItem('resume')) || new Resume();

    if (!this.resume.experiences || this.resume.experiences.length === 0) {
      this.resume.experiences = [];
      this.resume.experiences.push(new Experience());
    }
    if (!this.resume.educations || this.resume.educations.length === 0) {
      this.resume.educations = [];
      this.resume.educations.push(new Education());
    }
    if (!this.resume.skills || this.resume.skills.length === 0) {
      this.resume.skills = [];
      this.resume.skills.push(new Skill());
    }
  }

  // tslint:disable-next-line: typedef
  addExperience() {
    this.resume.experiences.push(new Experience());
  }

  // tslint:disable-next-line: typedef
  addEducation() {
    this.resume.educations.push(new Education());
  }

  // tslint:disable-next-line: typedef
  generatePdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinition();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // tslint:disable-next-line: typedef
  resetForm() {
    this.resume = new Resume();
  }
  // tslint:disable-next-line: typedef
  getDocumentDefinition() {

    sessionStorage.setItem('resume', JSON.stringify(this.resume));
    return {
      // ################################ START OF CONTENT ############################################
      content: [
        {
          text: 'RESUME',
          bold: true,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            [{
              text: this.resume.name,
              style: 'name'
            },
            {
              text: this.resume.address
            },
            {
              text: 'Email : ' + this.resume.email,
            },
            {
              text: 'Contant No : ' + this.resume.contactNo,
            },
            {
              text: 'GitHub: ' + this.resume.socialProfile,
              link: this.resume.socialProfile,
              color: 'blue',
            },
            ],
            [
              // Document definition for Profile pic
              this.getProfilePicObject()
            ]
          ]
        },

        // Skills section
        {
          text: 'Skills',
          style: 'header'
        },
        {
          columns: [
            {
              ul: [
                ...this.resume.skills.filter((value, index) => index % 3 === 0).map(s => s.value)
              ]
            },
            {
              ul: [
                ...this.resume.skills.filter((value, index) => index % 3 === 1).map(s => s.value)
              ]
            },
            {
              ul: [
                ...this.resume.skills.filter((value, index) => index % 3 === 2).map(s => s.value)
              ]
            }
          ]
        },

        // Tables section
        {
          text: 'Experience',
          style: 'header'
        },
        this.getExperienceObject(this.resume.experiences),
        {
          text: 'Education',
          style: 'header'
        },
        this.getEducationObject(this.resume.educations),

        // Other details & QR Code
        {
          text: 'Other Details',
          style: 'header'
        },
        {
          text: this.resume.otherDetails
        },
        {
          text: 'Signature',
          style: 'sign'
        },
        {
          columns: [
            { qr: this.resume.name + ', Contact No : ' + this.resume.contactNo, fit: 100 },
            {
              text: `(${this.resume.name})`,
              alignment: 'right',
            }
          ]
        }
      ],

      // ################################ END OF CONTENT ############################################

      // PDF Metadata
      info: {
        title: this.resume.name + '_RESUME',
        author: this.resume.name,
        subject: 'RESUME',
        keywords: 'RESUME, ONLINE RESUME',
      },

      // Styling for things inside content
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
          decoration: 'underline'
        },
        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },
        tableHeader: {
          bold: true,
        }
      }
    };
  }

  // tslint:disable-next-line: typedef
  fileChanged(e) {
    const file = e.target.files[0];
    this.getBase64(file);
  }

  // tslint:disable-next-line: typedef
  getBase64(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      this.resume.profilePic = reader.result as string;
    };
    reader.onerror = (error) => {
      console.log('Error: ', error);
    };
  }

  // tslint:disable-next-line: typedef
  addSkill() {
    this.resume.skills.push(new Skill());
  }

  // tslint:disable-next-line: typedef
  getProfilePicObject() {
    if (this.resume.profilePic) {
      return {
        image: this.resume.profilePic,
        width: 75,
        alignment: 'right'
      };
    }
    return null;
  }

  /**
   * Generate experience table dynamically
   * @param experiences an array of experiences
   * returns the properties of a table to be added in the getDocumentDefinition
   */
  // tslint:disable-next-line: typedef
  getExperienceObject(experiences: Experience[]) {
    const exs = [];
    experiences.forEach(experience => {
      exs.push(
        [{
          columns: [
            [{
              text: experience.jobTitle,
              style: 'jobTitle'
            },
            {
              text: experience.employer,
            },
            {
              text: experience.jobDescription,
            }],
            {
              text: 'Experience : ' + experience.experience + ' Months',
              alignment: 'right'
            }
          ]
        }]
      );
    });
    return {
      table: {
        widths: ['*'],
        body: [
          ...exs
        ]
      }
    };
  }

  /**
   * Generate education table dynamically
   * @param educations array of education
   * returns the properties of a table to be added in the getDocumentDefinition
   */
  // tslint:disable-next-line: typedef
  getEducationObject(educations: Education[]) {
    return {
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [{
            text: 'Degree',
            style: 'tableHeader'
          },
          {
            text: 'College',
            style: 'tableHeader'
          },
          {
            text: 'Passing Year',
            style: 'tableHeader'
          },
          {
            text: 'Result',
            style: 'tableHeader'
          },
          ],
          ...educations.map(ed => {
            return [ed.degree, ed.college, ed.passingYear, ed.percentage];
          })
        ]
      }
    };
  }

  // tslint:disable-next-line: typedef
  // generatePdf() {
  //   const documentDefinition = { content: 'This is an sample PDF printed with pdfMake' };
  //   pdfMake.createPdf(documentDefinition).open();
  // }
}
