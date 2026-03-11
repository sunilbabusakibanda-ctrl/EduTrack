const fs = require('fs');
const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, ExternalHyperlink, BorderStyle,
    Table, TableRow, TableCell, WidthType,
    PageNumber, Header, Footer
} = require('docx');

// Helper to create a vertical spacer
const spacer = () => new Paragraph({ text: "", spacing: { before: 200, after: 200 } });

const doc = new Document({
    styles: {
        paragraphStyles: [
            {
                id: "Normal",
                name: "Normal",
                run: {
                    font: "Calibri",
                    size: 22, // 11pt
                }
            },
            {
                id: "Heading1",
                name: "Heading 1",
                run: {
                    font: "Calibri",
                    size: 36, // 18pt
                    bold: true,
                    color: "2563EB",
                },
                paragraph: {
                    spacing: { before: 400, after: 200 },
                    border: {
                        bottom: { color: "2563EB", space: 1, style: BorderStyle.SINGLE, size: 6 },
                    }
                }
            },
            {
                id: "Heading2",
                name: "Heading 2",
                run: {
                    font: "Calibri",
                    size: 28, // 14pt
                    bold: true,
                    color: "1E293B",
                },
                paragraph: {
                    spacing: { before: 300, after: 150 },
                }
            }
        ]
    },
    sections: [{
        properties: {
            titlePage: true,
        },
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "EduTrack Systems", bold: true, color: "64748B" }),
                        ],
                        alignment: AlignmentType.RIGHT,
                    })
                ]
            })
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun("Page "),
                            new TextRun({
                                children: [PageNumber.CURRENT],
                            }),
                            new TextRun(" of "),
                            new TextRun({
                                children: [PageNumber.TOTAL_PAGES],
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                    })
                ]
            })
        },
        children: [
            // COVER PAGE
            spacer(), spacer(), spacer(),
            new Paragraph({
                text: "v1.0.0",
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "v1.0.0", color: "64748B", size: 24 })]
            }),
            new Paragraph({
                text: "EduTrack Installation & Configuration Guide",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
            }),
            spacer(),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "Comprehensive setup manual for School Administrators",
                        italics: true,
                        color: "475569",
                        size: 28
                    })
                ]
            }),
            spacer(), spacer(), spacer(), spacer(),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "Prepared For:", bold: true }),
                    new TextRun({ text: "\nVikas School Management", break: 1 })
                ]
            }),
            spacer(),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "Date Created: " + new Date().toLocaleDateString(), size: 20 })
                ]
            }),

            // PAGE BREAK
            new Paragraph({ text: "", pageBreakBefore: true }),

            // TABLE OF CONTENTS (Manual Placeholder)
            new Paragraph({ text: "Introduction", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({
                text: "This document provides step-by-step instructions for installing and configuring the EduTrack managed package. Please follow the steps in order to ensure a successful setup."
            }),

            new Paragraph({ text: "Step 1: Enable Person Accounts", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({
                children: [
                    new TextRun({ text: "CRITICAL: ", bold: true, color: "EF4444" }),
                    new TextRun("Person Accounts MUST be enabled before installing the package.")
                ]
            }),
            spacer(),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "1", alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1", bold: true })] })],
                                width: { size: 5, type: WidthType.PERCENTAGE },
                                shading: { fill: "F1F5F9" }
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "Go to Setup > Account Settings." })],
                                width: { size: 95, type: WidthType.PERCENTAGE }
                            })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "2", alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2", bold: true })] })],
                                shading: { fill: "F1F5F9" }
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "Check 'Allow Customer Support to enable Person Accounts'." })]
                            })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: "3", alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3", bold: true })] })],
                                shading: { fill: "F1F5F9" }
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: "Click the 'Enable Person Accounts' button." })]
                            })
                        ]
                    })
                ]
            }),

            new Paragraph({ text: "Step 2: Package Installation", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "Once Person Accounts are active, install the package using the link below:" }),
            spacer(),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new ExternalHyperlink({
                        children: [
                            new TextRun({
                                text: "👉 INSTALL PACKAGE (v1.0.0-1)",
                                bold: true,
                                color: "2563EB",
                                underline: {},
                                size: 26
                            }),
                        ],
                        link: "https://login.salesforce.com/packaging/installPackage.apexp?p0=04tOS00000MFB1hYAH",
                    }),
                ],
            }),
            spacer(),
            new Paragraph({ text: "• Choose: Install for All Users", bullet: { level: 0 } }),
            new Paragraph({ text: "• Click: Install", bullet: { level: 0 } }),

            new Paragraph({ text: "Step 3: Post-Installation Config", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: "3.1 Permissions", bold: true }),
            new Paragraph({ text: "Assign the 'EduTrack Full Access' permission set to all administrative users." }),

            spacer(),
            new Paragraph({ text: "3.2 Setup Wizard", bold: true }),
            new Paragraph({ text: "Open the EduPro Dashboard app and complete the primary setup wizard including School Name, Logo, and Payment IDs (PhonePe/GPay)." }),

            spacer(),
            new Paragraph({ text: "3.3 Operational Baseline", bold: true }),
            new Paragraph({ text: "Ensure at least one Academic Year is created and marked as 'Active' to enable admission features." }),

            spacer(), spacer(),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "End of Documentation", color: "94A3B8" })
                ]
            })
        ],
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("EduTrack_Installation_Guide_v2.docx", buffer);
    console.log("Premium Document v2 created successfully!");
});
