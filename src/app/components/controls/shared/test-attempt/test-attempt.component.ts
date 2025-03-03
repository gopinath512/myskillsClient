import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TestAttempt, TestAttemptDetail, TestAttemptOption } from '../../../../models/tests/testAttempt/testAttempt';
import { Chart } from 'chart.js';
import { TestReportServiceService } from '../../../../services/testReport/test-report.service.service';
import { AlertService } from '../../../../services/alert.service';
import { AuthService } from '../../../../services/auth.service';

//export const sampleTestAttempts: TestAttempt[] = [
//  {
//    testId:1,
//    version: "54",
//    questions: 65,
//    duration: "2 hours 10 minutes",
//    passRate: 72,
//    status: "Passed",
//    score: 78,
//    timeTaken: "2 hours 4 minutes",
//    date: "11/13/2023",
//    chartOptions: {
//      chartType: 'pie', // Specify the chart type
//      chartLabels: ['Correct', 'Wrong', 'Skipped/Unanswered'], // Chart labels
//      chartData: [
//        {
//          data: [10, 5, 0], // Data for the chart
//          labels: ['Correct', 'Wrong', 'Skipped/Unanswered'],
//          backgroundColor: ['#D4F0EC', '#FEDBC6', '#FFC107'], // Background colors
//        },
//      ],
//    },
//    knowledgeAreas: [
//      {
//        name: "Design Secure Architectures",
//        totalQuestions: 27,
//        correctPercentage: 70,
//        wrongPercentage: 30,
//      },
//      {
//        name: "Design High-Performing Architectures",
//        totalQuestions: 15,
//        correctPercentage: 87,
//        wrongPercentage: 13,
//      },
//    ],
//  },
//  {
//    testId:1,
//    version: "51",
//    questions: 65,
//    duration: "2 hours 10 minutes",
//    passRate: 72,
//    status: "Failed",
//    score: 60,
//    timeTaken: "2 hours 8 minutes",
//    date: "7/2/2023",
//    chartOptions: {
//      chartType : 'pie',
//      chartLabels :['Correct', 'Wrong', 'Skipped/Unanswered'],
//      chartData :[
//        {
//          data: [10, 5, 0],
//          labels: ['Correct', 'Wrong', 'Skipped/Unanswered'],
//          backgroundColor: ['#D4F0EC', '#FEDBC6', '#FFC107']
//        }
//      ],
//    },
//    knowledgeAreas: [
//      {
//        name: "Design Cost-Optimized Architectures",
//        totalQuestions: 11,
//        correctPercentage: 82,
//        wrongPercentage: 18,
//      },
//      {
//        name: "Design Resilient Architectures",
//        totalQuestions: 12,
//        correctPercentage: 83,
//        wrongPercentage: 17,
//      },
//    ],
//  },
//];


@Component({
  selector: 'app-test-attempt',
  templateUrl: './test-attempt.component.html',
  styleUrls: ['./test-attempt.component.scss']
})
export class TestAttemptComponent implements OnChanges, OnDestroy {
  chart: any;
  @Input() learnerId: string;
  @Input() testId: number;
  currentTestId: number;
  currentAttemptId: number;
  chartOptions = this.getChartOptions();
  public customersChartOptions: any = {};
  obj = {
    primary: "#6571ff",
    secondary: "#7987a1",
    success: "#05a34a",
    info: "#66d1d1",
    warning: "#fbbc06",
    danger: "#ff3366",
    light: "#e9ecef",
    dark: "#060c17",
    muted: "#7987a1",
    gridBorder: "rgba(77, 138, 240, .15)",
    bodyColor: "#000",
    cardBg: "#fff",
    fontFamily: "'Roboto', Helvetica, sans-serif"
  }

  isExpanded(index: number): boolean {
    return this.expandedIndex === index;
  }

  markExpanded(index: number): void {
    this.expandedIndex = index;
  }

  getExpandedChartOptions() {
    return {
      ...this.chartOptions,
      aspectRatio: 1.5, // Adjust the size for expanded view
    };
  }

  chartHovered(e): void {
    //console.log(e);
  }

  getChartOptions(customOptions = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#495057',
            font: { size: 12 },
          },
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: false,
          callbacks: {
            label: (tooltipItem) => {
              const datasetLabel = tooltipItem.dataset.label || '';
              const value = tooltipItem.raw;
              return `${datasetLabel}: ${value}%`;
            },
          },
        },
      },
      layout: {
        padding: { top: 20, bottom: 10 },
      },
      scales: {
        x: {
          display: false,
          grid: { drawBorder: false, display: false },
        },
        y: {
          display: false,
          grid: { drawBorder: false, display: false },
        },
      },
      elements: {
        arc: {
          borderWidth: 1,
          borderColor: '#ffffff',
          backgroundColor: (context) => {
            const colors = ['#28a745', '#dc3545'];
            return colors[context.dataIndex % colors.length];
          },
        },
      },
      ...customOptions, // Allows overriding or extending options
    };
  }
  


  chartType = 'pie';
  chartLabels = ['Correct', 'Wrong', 'Skipped/Unanswered'];
  chartData = [
    {
      data: [10, 5,0],
      labels: ['Correct', 'Wrong', 'Skipped/Unanswered'],
      backgroundColor: ['#D4F0EC', '#FEDBC6', '#FFC107']
    }
  ];



  timerReference: any;
  public cloudStorageChartOptions: any = {};

  attemptData: TestAttempt[];

  expandedIndex: number | null = null; // Track the currently expanded index

 
  constructor(private authService: AuthService, private testReportServiceService: TestReportServiceService, private alertService: AlertService) { }

  //ngOnInit(): void {
  //  console.log('ng OnInit from test attempt');
  //     this.attemptData = sampleTestAttempts;
  //  if (this.testId) {
  //    this.testReportServiceService.getTestReports(this.testId, this.learnerId).subscribe({
  //      next: (data) => {
  //        this.attemptData = data;
  //        this.initPerformanceTrendChart();
  //        this.customersChartOptions = this.getCustomerseChartOptions(this.obj);
  //      },
  //      error: (error) => console.error(error)
  //    });
  //  }
  //  //this.attemptData = this.testReportServiceService.getTestReports();

  //}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.learnerId || changes.testId) {
      if (this.testId && this.learnerId) {
        this.currentTestId = this.testId;
        this.testReportServiceService.getTestReports(this.testId, this.learnerId).subscribe({
          next: (data) => {
            this.attemptData = data;
             this.currentTestId
            this.initPerformanceTrendChart();
            this.customersChartOptions = this.getCustomerseChartOptions(this.obj);
          },
          error: (error) => console.error(error)
        });
      }
      //this.attemptData = this.testReportServiceService.getTestReports();
    }
  }

  showTestResult: boolean = false; // Tracks if the test result should be shown

  // Method to toggle the test result display
  showTestResultComponent(testId: number, attemptId: number) {
   
    //this.currentTestId: = 1; // Example test ID
    this.currentAttemptId = testId; // Example attempt ID
    this.currentAttemptId = attemptId;
    
    this.showTestResult = true;

    // Show the test result component
  }

  // Method to hide the test result and return to the main view
  hideTestResultComponent() {
    this.showTestResult = false; // Hide the test result component
  }

  toggleAccordion(index: number) {
    if (this.expandedIndex === index) {
      this.expandedIndex = null; // Collapse if already expanded
    } else {
      this.expandedIndex = index; // Expand the clicked accordion
    }
  }
  getCustomerseChartOptions(obj: any) {
    return {
      series: [{
        name: '',
        data: [3844, 3855, 3841, 3867, 3822, 3843, 3821, 3841, 3856, 3827, 3843]
      }],
      chart: {
        type: "line",
        height: 60,
        sparkline: {
          enabled: !0
        }
      },
      colors: [obj.primary],
      xaxis: {
        type: 'datetime',
        categories: ["Jan 01 2022", "Jan 02 2022", "Jan 03 2022", "Jan 04 2022", "Jan 05 2022", "Jan 06 2022", "Jan 07 2022", "Jan 08 2022", "Jan 09 2022", "Jan 10 2022", "Jan 11 2022",],
      },
      stroke: {
        width: 2,
        curve: "smooth"
      },
      markers: {
        size: 0
      },
    }
  };

  loadAttemptDetails(attemptId: number) {
    // Logic to load attempt details, if needed
    console.log('Load details for attempt ID:', attemptId);
  }

  reviewQuestions(attemptId: number) {
    console.log(`Reviewing questions for attempt ID: ${attemptId}`);
    // Logic to navigate to a detailed review screen or perform another action
  }

  ngOnDestroy() {
    clearInterval(this.timerReference);
  }



  initPerformanceTrendChart() {
    this.chart = new Chart('performanceTrendChart', {
      type: 'line', // Example chart type
      data: {
        labels: ['Test 1', 'Test 2', 'Test 3', 'Test 4'], // X-axis labels
        datasets: [
          {
            label: 'Performance Trend',
            data: [75, 85, 80, 90], // Example data for the trend
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

}
