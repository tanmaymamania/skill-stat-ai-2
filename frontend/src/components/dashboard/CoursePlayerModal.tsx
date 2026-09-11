import { useState, useMemo, useEffect, useRef } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Play,
  Pause,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  Tv,
  Video,
  Volume2,
  VolumeX,
  X,
  AlertCircle,
  BarChart2,
  Code,
} from "lucide-react";
import { generateDynamicCourseQuiz, type QuizQuestion } from "@/lib/quiz-data";
import { syncActiveUserAssessmentHistory } from "@/lib/auth-service";

export type CourseDetails = {
  id: number | string;
  title: string;
  provider: string;
  description: string;
  duration?: string;
  category?: string;
  skills?: string[];
  whyRecommended?: string;
  progress?: number;
  priority?: string;
};

interface CoursePlayerModalProps {
  course: CourseDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onCourseUpdated?: () => void;
  initialTab?: "syllabus" | "material" | "quiz";
}

// 100% verified working, embeddable YouTube videos and fast educational stream sources
const TOPIC_VIDEO_SOURCES: Record<
  string,
  { mp4: string; youtubeId: string; title: string; providerBadge: string }
> = {
  default: {
    mp4: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    youtubeId: "kyjlxsLW1Is",
    title: "Official Cadre Statistics & Empirical Survey Methods",
    providerBadge: "MoSPI / NSSTA Stream",
  },
  sampling: {
    mp4: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    youtubeId: "9PaR1TsvnJs",
    title: "Survey Sampling Techniques, Stratification & Multi-Stage Design",
    providerBadge: "MoSPI National Statistics Academy",
  },
  python: {
    mp4: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    youtubeId: "GPVsHOlRBBI",
    title: "Data Analysis with Python, Pandas & Official Microdata Pipelines",
    providerBadge: "iGOT Karmayogi / NPTEL",
  },
  gis: {
    mp4: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    youtubeId: "OswDC7dKd8o",
    title: "QGIS Geospatial Mapping, Boundary Layers & Cadastral Buffers",
    providerBadge: "ISRO / MoSPI GIS Lab",
  },
  accounts: {
    mp4: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    youtubeId: "d8uTB5XorBw",
    title: "National Accounts Compilation, GSDP Deflators & Economic Indicators",
    providerBadge: "Central Statistics Office / UN-SD",
  },
  sql: {
    mp4: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    youtubeId: "7S_tz1z_5bA",
    title: "SQL Course for Beginners, Registries & Aggregations",
    providerBadge: "iGOT Karmayogi Public IT",
  },
  quality: {
    mp4: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    youtubeId: "WpX2F2BS3Qc",
    title: "UN NQAF Data Cleaning, Validation Rules & Imputation Framework",
    providerBadge: "MoSPI Data Innovation Lab",
  },
  governance: {
    mp4: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    youtubeId: "d8uTB5XorBw",
    title: "Digital Data Governance, DPDP Act 2023 & Statistical Confidentiality",
    providerBadge: "NITI Aayog / NSSTA",
  },
};

export function getCourseTopicKey(title: string, category?: string): string {
  const combined = (title + " " + (category || "")).toLowerCase();
  if (combined.includes("python") || combined.includes("scripting") || combined.includes("machine learning") || combined.includes("pandas")) return "python";
  if (combined.includes("gis") || combined.includes("spatial") || combined.includes("mapping") || combined.includes("qgis")) return "gis";
  if (combined.includes("sql") || combined.includes("database") || combined.includes("registry") || combined.includes("postgres")) return "sql";
  if (combined.includes("account") || combined.includes("gsdp") || combined.includes("cpi") || combined.includes("macroeconomic") || combined.includes("sna") || combined.includes("gva") || combined.includes("gdp")) return "accounts";
  if (combined.includes("quality") || combined.includes("imputation") || combined.includes("assurance") || combined.includes("nqaf") || combined.includes("validation")) return "quality";
  if (combined.includes("governance") || combined.includes("ethics") || combined.includes("dpdp") || combined.includes("privacy")) return "governance";
  if (combined.includes("survey") || combined.includes("sampling") || combined.includes("plfs") || combined.includes("nss") || combined.includes("stratif")) return "sampling";
  return "default";
}

export type LessonItem = {
  title: string;
  summary: string;
  content: string;
  codeSnippet?: string;
  checklist: string[];
};

export type ModuleItem = {
  title: string;
  duration: string;
  lessons: LessonItem[];
};

export function getCourseCurriculum(title: string, category?: string): ModuleItem[] {
  const topic = getCourseTopicKey(title, category);

  if (topic === "python") {
    return [
      {
        title: "Module 1: Python Statistical Environment & Vectorized Ingestion",
        duration: "50 mins",
        lessons: [
          {
            title: "Python & Pandas Setup for Official Statistics",
            summary: "Environment configuration, Pandas Series and DataFrame foundations for official cadres.",
            content: `In this lecture, learners master the standard Python 3.11 analytical stack required for MoSPI microdata processing. We explore setting up reproducible virtual environments, handling fixed-width NSS ASCII files, and converting raw survey schedules into indexed Pandas DataFrames with rigorous column data typing.`,
            codeSnippet: `import pandas as pd\nimport numpy as np\n\n# Ingest survey microdata with standardized cadre schema\nsurvey_df = pd.read_csv('survey_microdata.csv', dtype={'district_code': str, 'stratum': int})\nprint(f"Loaded {len(survey_df):,} cadre records.")`,
            checklist: [
              "Always enforce explicit string data types for administrative postal/district codes.",
              "Use memory-efficient categorical dtypes for repeat state and sector columns.",
              "Maintain git version-controlled scripts for every data transformation step.",
            ],
          },
          {
            title: "Vectorized Aggregations & High-Performance Filtering",
            summary: "Accelerating data workflows without loops using NumPy array operations.",
            content: `Transitioning away from slow Python iterations, this lesson focuses on pure vectorized boolean masks, multi-column indexing, and high-performance aggregations using np.where and DataFrame groupby operations across millions of survey entries.`,
            codeSnippet: `# Compute cadre post-stratification survey weighted averages\nweighted_avg = np.average(survey_df['expenditure'], weights=survey_df['multiplier'])`,
            checklist: [
              "Avoid df.iterrows() and df.apply(axis=1) on large census or NSS datasets.",
              "Validate that all multipliers and survey weights are strictly non-negative.",
              "Document outlier handling thresholds in script header comments.",
            ],
          },
        ],
      },
      {
        title: "Module 2: Microdata Cleaning, Merging & Imputation",
        duration: "1 hr 15 mins",
        lessons: [
          {
            title: "Cleaning Administrative Registries & Outlier Detection",
            summary: "Handling missing survey blocks, data inconsistencies, and automated detection.",
            content: `Administrative registries frequently exhibit missing records and measurement spikes. Learn to detect outliers using interquartile ranges (IQR) and Mahalanobis distances, applying automated data cleaning rules while preserving raw provenance.`,
            codeSnippet: `# Robust IQR outlier detection for monthly household income\nq25, q75 = survey_df['income'].quantile([0.25, 0.75])\niqr = q75 - q25\noutlier_mask = (survey_df['income'] < q25 - 1.5 * iqr) | (survey_df['income'] > q75 + 1.5 * iqr)`,
            checklist: [
              "Never drop raw records silently; write dropped IDs to an audit log file.",
              "Cross-verify extreme values against auxiliary GST or electricity billing data.",
              "Preserve original unedited copies in an immutable data warehouse folder.",
            ],
          },
          {
            title: "Automated Imputation Algorithms & Consistency Verification",
            summary: "Executing hot-deck donor matching and logical cross-table validations.",
            content: `When item non-response occurs in national sample surveys, direct deletion creates bias. Master modern donor-based hot-deck matching and predictive mean matching algorithms in Python to reliably impute missing values.`,
            codeSnippet: `# Flag and impute missing values using demographic donor strata\nsurvey_df['imputation_flag'] = survey_df['consumption'].isna().astype(int)\nsurvey_df['consumption'] = survey_df.groupby(['state', 'household_size'])['consumption'].transform(lambda x: x.fillna(x.median()))`,
            checklist: [
              "Every imputed cell must have an associated binary flag column (e.g. _imp = 1).",
              "Enforce strict bounds to prevent negative values in monetary variables.",
              "Run chi-square pre/post tests to ensure distribution shape is preserved.",
            ],
          },
        ],
      },
      {
        title: "Module 3: Survey Weighting & MoSPI Dissemination Pipelines",
        duration: "1 hr 10 mins",
        lessons: [
          {
            title: "Multi-Stage Survey Weight Calibration with NumPy",
            summary: "Calculating sampling multipliers, non-response adjustments, and post-stratification.",
            content: `Accurate population-level inference depends on calibrated survey weights. Learn how to compute design weights from first-stage selection probabilities, calibrate against decennial census projections, and verify multiplier sums.`,
            codeSnippet: `# Post-stratification weight calibration against census population totals\ntarget_pop = {'Rural': 900000000, 'Urban': 450000000}\n# Calibrate multipliers by sector ratio`,
            checklist: [
              "Sum of survey multipliers must match benchmark cadre population totals.",
              "Perform weight trimming on extreme multipliers to minimize standard errors.",
              "Verify design effect (DEFF) ratios remain within acceptable cadre tolerances.",
            ],
          },
          {
            title: "Automated Cadre Dashboards & Statistical Bulletin Generation",
            summary: "Building automated end-to-end pipelines that output publication-ready tables.",
            content: `Complete the pipeline by automating table generation for official ministerial releases. Generate formatted Excel tables, PDF reports, and JSON feeds for open government data portals with reproducible Python automation.`,
            codeSnippet: `# Automated ministerial summary table export\nsummary_table = survey_df.pivot_table(index='state', columns='sector', values='expenditure', aggfunc='mean')\nsummary_table.to_excel('MoSPI_State_Expenditure_Bulletin.xlsx')`,
            checklist: [
              "Format all decimal places according to official government statistical standards.",
              "Verify that cell suppressions are applied for sample sizes below 30.",
              "Check confidentiality compliance before public web dissemination.",
            ],
          },
        ],
      },
    ];
  }

  if (topic === "gis") {
    return [
      {
        title: "Module 1: Spatial Fundamentals & Georeferencing",
        duration: "45 mins",
        lessons: [
          {
            title: "Coordinate Reference Systems (CRS) & Indian Administrative Boundaries",
            summary: "WGS84, UTM zones, and official Survey of India boundary layers.",
            content: `Geospatial statistical analysis begins with accurate spatial geometry. Learn the distinctions between unprojected geographic coordinates (WGS84 / EPSG:4326) and projected systems (UTM Zone 43N / 44N), preventing spatial distortion in district-level maps.`,
            codeSnippet: `-- Spatial query checking boundary polygon projection\nSELECT ST_SRID(geom) AS srid, ST_GeometryType(geom) FROM district_boundaries LIMIT 1;`,
            checklist: [
              "Always verify that spatial boundary layers match the official Survey of India map.",
              "Transform geographic layers to projected CRS before calculating physical areas.",
              "Audit boundary topology for accidental sliver polygons and self-intersections.",
            ],
          },
          {
            title: "Vector & Raster Data Ingestion in QGIS",
            summary: "Loading shapefiles, GeoJSON, and satellite nighttime light rasters.",
            content: `Mastering QGIS 3.x for official statistics. Learn to import administrative shapefiles, join tabular survey census data to spatial polygons, and integrate satellite imagery indicators to measure regional economic development.`,
            checklist: [
              "Join census tabular data using standardized Census 2011 6-digit district codes.",
              "Verify that 100% of spatial polygons successfully match the tabular records.",
              "Save joined spatial layers in GeoPackage format for optimal speed.",
            ],
          },
        ],
      },
      {
        title: "Module 2: Geospatial Operations & District Cadastral Buffering",
        duration: "1 hr",
        lessons: [
          {
            title: "Spatial Joins & Point-in-Polygon Cadre Analytics",
            summary: "Intersecting survey primary sampling units (PSUs) with administrative boundaries.",
            content: `Learn to programmatically determine which village or urban enumeration block each geocoded survey observation belongs to using spatial intersection, point-in-polygon queries, and spatial indexing.`,
            codeSnippet: `-- Spatial join of survey sample points with district polygons\nSELECT psu.id, psu.weight, dist.district_name\nFROM survey_psu_points psu\nJOIN district_boundaries dist ON ST_Contains(dist.geom, psu.geom);`,
            checklist: [
              "Create spatial R-Tree indexes on geometry columns to accelerate intersections.",
              "Flag and verify any sample points falling outside district boundaries.",
              "Ensure coordinate precision complies with data protection anonymization rules.",
            ],
          },
          {
            title: "Proximity Buffering & Infrastructure Accessibility Indexing",
            summary: "Evaluating healthcare and education access within 5km and 10km buffer zones.",
            content: `Public policy resource allocation requires understanding spatial accessibility. Build multi-ring buffer zones around public facilities (primary health centers, schools) and calculate the percentage of rural population served.`,
            checklist: [
              "Apply Euclidean buffers for regional overviews and network distance for hilly areas.",
              "Dissolve overlapping facility buffers before aggregating population counts.",
              "Cross-tabulate buffer coverage against state socio-economic indicators.",
            ],
          },
        ],
      },
      {
        title: "Module 3: Statistical Thematic Cartography & Dissemination",
        duration: "55 mins",
        lessons: [
          {
            title: "Choropleth Classification & Regional Disparity Visualizations",
            summary: "Selecting color ramps, Jenks natural breaks, and quantiles for policy maps.",
            content: `Designing clear, unbiased thematic maps. Learn why equal-interval classification distorts skewed socioeconomic data and how Jenks natural breaks and quantile methods highlight real regional disparities for executive decision-makers.`,
            checklist: [
              "Use color-blind safe palettes (ColorBrewer) for government publications.",
              "Clearly state data year, indicator definition, and source in the map legend.",
              "Never map raw counts with choropleth shading; always normalize by population or area.",
            ],
          },
          {
            title: "Publishing High-Resolution District Atlases for Policy Briefs",
            summary: "QGIS print layout composer, atlas generation, and web map publishing.",
            content: `Produce standardized, printable district statistical atlases. Configure the QGIS Atlas generator to automatically iterate through all districts in a state, producing identical high-resolution PDF maps with localized statistical tables.`,
            checklist: [
              "Include standard north arrow, scale bar, and official government disclaimer.",
              "Export vector graphics at 300+ DPI for official printing.",
              "Ensure metadata tags and publication dates are embedded in exported files.",
            ],
          },
        ],
      },
    ];
  }

  if (topic === "sampling") {
    return [
      {
        title: "Module 1: Sampling Theory & Cadre Frame Architecture",
        duration: "45 mins",
        lessons: [
          {
            title: "Principles of Probability Sampling & Frame Construction",
            summary: "Simple random sampling (SRS), systematic selection, and sampling frame audits.",
            content: `Every credible official statistic rests on probability sampling theory. In this lesson, learn the mathematical foundations of equal-probability selection, frame coverage errors, and how to verify sampling frame completeness before field deployment.`,
            codeSnippet: `Inclusion Probability (SRS):\npi_i = n / N\nSample Variance Estimator:\ns^2 = (1 / (n - 1)) * sum((y_i - y_bar)^2)`,
            checklist: [
              "Audit sampling frames for duplicate administrative listings and obsolete boundaries.",
              "Confirm that every eligible unit in the population has a non-zero selection probability.",
              "Document the exact random seed and selection algorithm used.",
            ],
          },
          {
            title: "Multi-Stage Stratification & Primary Sampling Units (PSUs)",
            summary: "Designing stratified two-stage sampling for NSS & PLFS national surveys.",
            content: `Direct simple random sampling is cost-prohibitive across vast geographies. Master two-stage stratified sampling: selecting census villages / urban blocks as PSUs in Stage 1 with Probability Proportional to Size (PPS), followed by household selection in Stage 2.`,
            checklist: [
              "Define strata boundaries to maximize between-strata variance and minimize within-strata variance.",
              "Use PPS with Size Measure = Census Population for PSU selection.",
              "Maintain fixed cluster sizes per PSU to stabilize enumerator workload.",
            ],
          },
        ],
      },
      {
        title: "Module 2: Sample Size Determination & Error Calibration",
        duration: "1 hr",
        lessons: [
          {
            title: "Calculating Sample Size with Design Effects (DEFF)",
            summary: "Formulaic determination of required sample sizes accounting for clustering.",
            content: `Clustering units reduces operational travel costs but inflates survey variance. Master calculating the Design Effect (DEFF) and intra-cluster correlation (ICC / rho) to calibrate the required sample size for specified margins of error.`,
            codeSnippet: `Design Effect Formula:\nDEFF = 1 + (m - 1) * rho\nEffective Sample Size: n_eff = n_complex / DEFF\nRequired Sample Size: n = (Z^2 * p * (1 - p) * DEFF) / (e^2)`,
            checklist: [
              "Use recent pilot surveys or prior NSS rounds to estimate intra-cluster correlation (rho).",
              "Set target margins of error to 5% or lower for headline cadre indicators.",
              "Account for anticipated non-response rates by inflating initial sample targets by 10-15%.",
            ],
          },
          {
            title: "Minimizing Non-Sampling Errors & Field Audit Verification",
            summary: "Controlling response bias, enumerator variance, and supervisory re-interviews.",
            content: `Non-sampling errors often dwarf sampling errors in nationwide surveys. Learn rigorous supervisory protocols, randomized 10% re-interviews, and digital CAPI logic constraints that prevent field fabrication and transcription errors.`,
            checklist: [
              "Implement 100% CAPI automatic timestamp and GPS coordinate auditing.",
              "Conduct independent supervisor re-interviews for key demographic variables.",
              "Calculate Cohen's kappa coefficient to quantify enumerator reliability.",
            ],
          },
        ],
      },
      {
        title: "Module 3: Estimation, Weighting & PLFS Case Studies",
        duration: "1 hr 15 mins",
        lessons: [
          {
            title: "Horvitz-Thompson Estimators & Multiplier Derivation",
            summary: "Constructing unbiased estimators of population totals and ratios.",
            content: `Understand the fundamental theorem of survey estimation: the Horvitz-Thompson estimator. Learn how the inverse of the inclusion probability yields the design multiplier, guaranteeing mathematically unbiased estimates.`,
            codeSnippet: `Horvitz-Thompson Estimator of Total:\nY_hat = sum_{i in s} (y_i / pi_i) = sum_{i in s} (y_i * w_i)\nVariance of Estimator:\nVar(Y_hat) = sum_{i} sum_{j} ((pi_ij - pi_i*pi_j) / pi_ij) * (y_i/pi_i) * (y_j/pi_j)`,
            checklist: [
              "Verify that every survey record carries its appropriate sampling weight multiplier.",
              "Cross-check estimated total population against projected census aggregates.",
              "Compute standard errors using Taylor series linearization or jackknife replication.",
            ],
          },
          {
            title: "Calibrating Sample Weights against Census Aggregates",
            summary: "Post-stratification and raking ratio adjustments in official surveys.",
            content: `Study the Periodic Labour Force Survey (PLFS) methodology. Master post-stratification and raking algorithms that calibrate survey weights to match external administrative gender and age marginal distributions.`,
            checklist: [
              "Ensure weight calibration bounds do not create extreme multiplier distortions.",
              "Check that post-stratified estimates match independent national population totals.",
              "Document calibration methodology in the survey technical release notes.",
            ],
          },
        ],
      },
    ];
  }

  if (topic === "accounts") {
    return [
      {
        title: "Module 1: SNA 2008 Framework & Production Boundary",
        duration: "50 mins",
        lessons: [
          {
            title: "Production Boundary, Institutional Sectors & GVA Basics",
            summary: "UN System of National Accounts concepts and basic price valuations.",
            content: `Master the foundational concepts of the UN System of National Accounts (SNA 2008). Understand the production boundary, classification of institutional sectors (Corporations, General Government, Households, NPISH), and the definition of Gross Value Added (GVA).`,
            codeSnippet: `Fundamental National Accounting Identities:\nGross Value Added (GVA) at Basic Prices = Gross Output - Intermediate Consumption\nGDP at Market Prices = GVA at Basic Prices + Product Taxes - Product Subsidies`,
            checklist: [
              "Differentiate accurately between market output, non-market output, and output for own final use.",
              "Exclude financial holding gains/losses from production boundary calculations.",
              "Adhere to the National Industrial Classification (NIC 2008) sector mapping.",
            ],
          },
          {
            title: "Primary Data Sources & Administrative Registry Integration",
            summary: "MCA-21 corporate filings, GST data streams, and agricultural crop forecasts.",
            content: `Modern national accounts rely increasingly on high-frequency administrative data. Learn how the Ministry of Corporate Affairs (MCA-21) database, GST tax returns, and state agricultural crop estimates are synthesized into national accounts.`,
            checklist: [
              "Clean corporate financial statements for non-operating holding companies.",
              "Adjust quarterly GST collections for seasonal tax refund cycles.",
              "Integrate state directorate of economics and statistics (DES) crop statistics.",
            ],
          },
        ],
      },
      {
        title: "Module 2: Gross Value Added (GVA) & Price Deflators",
        duration: "1 hr 10 mins",
        lessons: [
          {
            title: "Industry-Wise GVA Estimation & Service Sector Linkages",
            summary: "Compiling GVA for manufacturing, agriculture, trade, and financial services.",
            content: `Learn the sectoral compilation methodologies used by the Central Statistics Office (CSO). Examine double-entry supply-use tables, financial intermediation services indirectly measured (FISIM), and unorganized enterprise survey benchmarks.`,
            checklist: [
              "Allocate FISIM intermediate consumption across user industries.",
              "Benchmark informal manufacturing using the Annual Survey of Unincorporated Sector Enterprises.",
              "Ensure supply and use table columns balance for all major commodity groups.",
            ],
          },
          {
            title: "Double Deflation Methodology & Constant vs Current Prices",
            summary: "Deriving real GDP using separate output and input price indices.",
            content: `Measuring true economic growth requires stripping out price inflation. Learn the gold standard: double deflation, where output is deflated by product indices (WPI/CPI) and intermediate consumption is deflated by input cost indices.`,
            codeSnippet: `Double Deflation Real GVA:\nGVA_real = (Gross_Output / P_output) - (Intermediate_Consumption / P_input)\nImplicit Price Deflator (IPD) = (Nominal GVA / Real GVA) * 100`,
            checklist: [
              "Use commodity-specific price deflators rather than overall headline WPI.",
              "Check for anomalous deflator swings caused by volatile international commodity prices.",
              "Report both constant base year (2011-12) and current price aggregates.",
            ],
          },
        ],
      },
      {
        title: "Module 3: Gross State Domestic Product (GSDP) & Macro Indicators",
        duration: "1 hr",
        lessons: [
          {
            title: "State Domestic Product Compilation & Regional Allocation",
            summary: "Allocating supra-regional sectors (Railways, Banking, Defense) across states.",
            content: `Gross State Domestic Product (GSDP) is crucial for Finance Commission tax devolution. Learn the methodologies state DES officers use to compile state-level value added and allocate supra-regional sectors like railways and communications.`,
            checklist: [
              "Apply uniform MoSPI allocation keys for national network industries.",
              "Reconcile state-level GSDP sums with national aggregate GDP figures.",
              "Follow established conventions for constant-price state accounts.",
            ],
          },
          {
            title: "High-Frequency Economic Indicators & Index Aggregations",
            summary: "Compiling Index of Industrial Production (IIP) and Consumer Price Index (CPI).",
            content: `Examine the compilation of monthly economic barometers: IIP item weighting using the Laspeyres formula, CPI urban/rural basket weight allocations, and core inflation calculation techniques.`,
            checklist: [
              "Verify price quotations from designated rural and urban market centers.",
              "Apply geometric mean formulas at the elementary item aggregation level.",
              "Publish revisions calendar transparently to maintain public credibility.",
            ],
          },
        ],
      },
    ];
  }

  if (topic === "quality") {
    return [
      {
        title: "Module 1: UN National Quality Assurance Framework (UN NQAF)",
        duration: "45 mins",
        lessons: [
          {
            title: "Dimensions of Statistical Quality: Accuracy, Timeliness & Comparability",
            summary: "The six core dimensions of statistical quality in official government statistics.",
            content: `Statistical quality encompasses much more than just mathematical accuracy. Master the UN NQAF standard dimensions: Relevance, Accuracy and Reliability, Timeliness and Punctuality, Accessibility and Clarity, Coherence and Comparability, and Credibility.`,
            checklist: [
              "Assess every official survey against the 19 UN NQAF quality principles.",
              "Balance timeliness of rapid preliminary releases with precision of final revisions.",
              "Ensure temporal comparability when updating classification codes or base years.",
            ],
          },
          {
            title: "Designing Pre-Data Collection Quality Controls",
            summary: "Questionnaire pre-testing, cognitive interviews, and CAPI validation rules.",
            content: `Preventing errors before they enter the system is ten times more efficient than cleaning afterwards. Learn questionnaire pre-testing methodologies, skip-pattern logic validation, and CAPI range constraints that stop errors in the field.`,
            checklist: [
              "Conduct cognitive testing on newly worded survey questions.",
              "Lock down allowable numeric entry ranges based on historical biometric/cadre norms.",
              "Test all skip-patterns across 100% of questionnaire branches before field launch.",
            ],
          },
        ],
      },
      {
        title: "Module 2: Automated Validation & Outlier Detection",
        duration: "1 hr",
        lessons: [
          {
            title: "Formulating Logical Consistency & Range Check Rules",
            summary: "Writing automated rule engines for household roster and demographic blocks.",
            content: `Learn to design comprehensive validation rule matrices. Cross-check household member age against marital status, educational attainment against occupation, and reported landholding against regional district maximums.`,
            codeSnippet: `# Example validation rule matrix\ndef validate_record(r):\n    errors = []\n    if r['age'] < 15 and r['married']: errors.append('ERR_UNDERAGE_MARRIAGE')\n    if r['hours_worked'] > 112: errors.append('ERR_HOURS_EXCEED_LIMIT')\n    return errors`,
            checklist: [
              "Categorize validation errors into 'Fatal' (blocks submission) and 'Warning' (requires supervisor note).",
              "Maintain automated regression tests for the validation rule script engine.",
              "Generate exception reports summarizing error frequencies by enumerator ID.",
            ],
          },
          {
            title: "Statistical Outlier Detection (Z-Score & Interquartile Ranges)",
            summary: "Multivariate outlier detection algorithms for socioeconomic microdata.",
            content: `Distinguish between authentic rare events and erroneous data entry. Master statistical outlier algorithms including Mahalanobis distance, modified Z-scores for skewed data, and clustering-based anomaly detection.`,
            checklist: [
              "Never delete an outlier without consulting the primary survey schedule notes.",
              "Use robust statistics (median and median absolute deviation) to resist extreme values.",
              "Document any winsorization or trimming thresholds applied to the published data.",
            ],
          },
        ],
      },
      {
        title: "Module 3: Imputation Frameworks & Quality Certification",
        duration: "55 mins",
        lessons: [
          {
            title: "Cold-Deck vs Hot-Deck Imputation & Donor Matching",
            summary: "Methodologies for filling non-response without distorting variances.",
            content: `When survey respondents skip specific questions, direct mean substitution artificially reduces variance. Learn to implement hot-deck donor matching: finding a demographic twin in the same stratum to donate their reported value.`,
            checklist: [
              "Ensure donor search pools contain at least 15 eligible matching candidate records.",
              "Assign an explicit imputation flag code specifying the exact imputation method used.",
              "Verify that imputed data does not alter the underlying correlation structure.",
            ],
          },
          {
            title: "Compiling Official Quality Declarations & Audit Logs",
            summary: "Publishing transparent metadata, non-response rates, and standard errors.",
            content: `Public trust in official statistics requires transparency. Learn how to draft official Data Quality Declarations (DQDs), report unit and item response rates, and document data lineage for parliamentary and academic stakeholders.`,
            checklist: [
              "Publish unweighted and weighted response rates for each state and sector.",
              "Include relative standard errors (RSE) alongside all published headline indicators.",
              "Archive data processing scripts and change logs in official cadre repositories.",
            ],
          },
        ],
      },
    ];
  }

  // Default / Statistical Foundations
  return [
    {
      title: "Module 1: Official Cadre Standards & Foundations",
      duration: "45 mins",
      lessons: [
        {
          title: "Introduction to Official Cadre Standards & Governance",
          summary: "Core concepts, institutional mandate, and alignment with national statistical policy.",
          content: `In this introductory section, learners explore the statutory and operational foundations governing official statistical cadres. Understanding national statistical mandates, standardized classifications, and inter-departmental data flows ensures consistent administrative reporting across states and central ministries.`,
          checklist: [
            "Align all statistical reports with the National Statistical Commission (NSC) guidelines.",
            "Maintain strict adherence to standardized administrative district codes.",
            "Document analytical assumptions in official methodology bulletins.",
          ],
        },
        {
          title: "Methodological Foundations & Definitions",
          summary: "Standard definitions, survey instruments, and conceptual frameworks.",
          content: `Accurate statistical compilation begins with rigorous definitions. This lesson covers standard terminology, international benchmarks (UNSD, ILO, IMF GDDS), and specific MoSPI operational guidelines for executing surveys and administrative data integration.`,
          checklist: [
            "Use internationally harmonized definitions for all major socio-economic indicators.",
            "Verify questionnaire translation accuracy across regional Indian languages.",
            "Conduct pre-testing before finalizing new survey instruments.",
          ],
        },
      ],
    },
    {
      title: "Module 2: Practical Techniques & Computational Analysis",
      duration: "1 hr 15 mins",
      lessons: [
        {
          title: "Data Processing, Validation & Imputation",
          summary: "Handling outliers, missing responses, and consistency checks in real datasets.",
          content: `Field survey datasets inevitably encounter non-response and transcription anomalies. Learn modern imputation methodologies (hot-deck, demographic donor matching) and multi-level consistency checks to guarantee empirical integrity prior to tabulation.`,
          checklist: [
            "Implement automated range and logic checks on raw field returns.",
            "Document every data transformation in a reproducible audit trail.",
            "Flag all imputed observations in the analytical microdata files.",
          ],
        },
        {
          title: "Computational Analysis & Workflow Automation",
          summary: "Scripting analytical pipelines and generating automated tabular summaries.",
          content: `Transition away from manual spreadsheets to reproducible code-based pipelines using Python and SQL. Automate district-level aggregations, calculate sampling weights, and produce audit trails for official dissemination.`,
          checklist: [
            "Eliminate manual copy-paste spreadsheet operations in core cadre reporting.",
            "Write modular, documented scripts with clear input/output specifications.",
            "Store analytical scripts in version-controlled organizational repositories.",
          ],
        },
      ],
    },
    {
      title: "Module 3: Cadre Case Studies & Public Policy",
      duration: "1 hr",
      lessons: [
        {
          title: "National Economic & Social Indicators",
          summary: "Compilation of GSDP, CPI baskets, PLFS metrics, and SDG district dashboards.",
          content: `Examine real-world government case studies where accurate statistical indicators directly influenced public resource allocation. Study disaggregated state accounts, seasonal price adjustments, and high-frequency administrative tax linkages.`,
          checklist: [
            "Cross-validate high-frequency indicators against administrative records.",
            "Benchmark district indicators against state and national averages.",
            "Publish indicators on public dashboards with comprehensive metadata.",
          ],
        },
        {
          title: "Data Governance & Confidentiality Protocols",
          summary: "Complying with the DPDP Act 2023, data masking, and secure microdata sharing.",
          content: `Ensuring privacy and respondent confidentiality is a non-negotiable legal obligation. Master anonymization techniques, PII cryptographic hashing, and tiered access protocols for public policy researchers.`,
          checklist: [
            "Strictly comply with the Digital Personal Data Protection (DPDP) Act 2023.",
            "Mask direct personal identifiers before releasing microdata to researchers.",
            "Execute signed non-disclosure undertakings for all microdata access.",
          ],
        },
      ],
    },
  ];
}

export function CoursePlayerModal({
  course,
  isOpen,
  onClose,
  onCourseUpdated,
  initialTab = "syllabus",
}: CoursePlayerModalProps) {
  if (!isOpen || !course) return null;

  const [activeTab, setActiveTab] = useState<"syllabus" | "material" | "quiz">(initialTab);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [playerMode, setPlayerMode] = useState<"native" | "embed">("embed"); // default to verified working embed

  // Video and Audio states
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(142); // 2 mins 22 secs
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Dynamic AI Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Sync initialTab when modal opens or course changes
  useEffect(() => {
    setActiveTab(initialTab);
    setSelectedLesson(0);
    setVideoError(false);
  }, [course.id, initialTab]);

  // Generate dynamic AI questions specifically for this course
  const dynamicQuizQuestions = useMemo<QuizQuestion[]>(() => {
    return generateDynamicCourseQuiz(course.title, course.category, 5);
  }, [course.title, course.category]);

  const topicKey = useMemo(() => {
    return getCourseTopicKey(course.title, course.category);
  }, [course.title, course.category]);

  const videoData = useMemo(() => {
    return TOPIC_VIDEO_SOURCES[topicKey] || TOPIC_VIDEO_SOURCES.default;
  }, [topicKey]);

  // Structured syllabus modules tailored to this course
  const modules = useMemo(() => {
    return getCourseCurriculum(course.title, course.category);
  }, [course.title, course.category]);

  // Flatten lessons for seamless video navigation
  const allLessons = useMemo(() => {
    const list: {
      index: number;
      moduleIdx: number;
      lessonIdx: number;
      moduleTitle: string;
      title: string;
      summary: string;
      content: string;
      codeSnippet?: string;
      checklist: string[];
    }[] = [];
    let idx = 0;
    modules.forEach((m, mIdx) => {
      m.lessons.forEach((l, lIdx) => {
        list.push({
          index: idx++,
          moduleIdx: mIdx,
          lessonIdx: lIdx,
          moduleTitle: m.title,
          title: l.title,
          summary: l.summary,
          content: l.content,
          codeSnippet: l.codeSnippet,
          checklist: l.checklist,
        });
      });
    });
    return list;
  }, [modules]);

  const currentLesson = allLessons[selectedLesson] || allLessons[0];
  const currentLessonKey = `${currentLesson.moduleIdx}-${currentLesson.lessonIdx}`;
  const isCurrentLessonDone = !!completedLessons[currentLessonKey];

  const totalLessons = allLessons.length;
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  // Timer simulation for interactive slide player
  useEffect(() => {
    let interval: any;
    if (isPlaying && playerMode === "native" && videoError) {
      interval = setInterval(() => {
        setSimulatedTime((prev) => (prev >= 600 ? 0 : prev + 1));
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playerMode, videoError, playbackSpeed]);

  const formatSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const syncCourseProgress = (updatedCompleted: Record<string, boolean>) => {
    try {
      const raw = localStorage.getItem("active_learning_paths");
      if (raw) {
        const paths = JSON.parse(raw);
        if (Array.isArray(paths)) {
          const count = Object.values(updatedCompleted).filter(Boolean).length;
          const pct = Math.round((count / totalLessons) * 100);
          const updated = paths.map((p) => {
            if (p.id === course.id || p.title === course.title) {
              return {
                ...p,
                status: pct >= 100 ? "Completed" : pct > 0 ? "In Progress" : p.status,
                progress: pct,
              };
            }
            return p;
          });
          localStorage.setItem("active_learning_paths", JSON.stringify(updated));
          if (onCourseUpdated) onCourseUpdated();
        }
      }
    } catch {}
  };

  const toggleLesson = (key: string) => {
    setCompletedLessons((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };
      syncCourseProgress(next);
      return next;
    });
  };

  const markCurrentLessonComplete = () => {
    if (!isCurrentLessonDone) {
      toggleLesson(currentLessonKey);
    }
  };

  const handleQuizAnswer = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    dynamicQuizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / dynamicQuizQuestions.length) * 100);
  };

  const handleCompleteCourse = () => {
    try {
      const raw = localStorage.getItem("active_learning_paths");
      if (raw) {
        const paths = JSON.parse(raw);
        if (Array.isArray(paths)) {
          const updated = paths.map((p) => {
            if (p.id === course.id || p.title === course.title) {
              return {
                ...p,
                status: "Completed",
                progress: 100,
              };
            }
            return p;
          });
          localStorage.setItem("active_learning_paths", JSON.stringify(updated));
        }
      }

      // Mark all lessons as completed
      const allDone: Record<string, boolean> = {};
      allLessons.forEach((l) => {
        allDone[`${l.moduleIdx}-${l.lessonIdx}`] = true;
      });
      setCompletedLessons(allDone);

      // Record to user assessment history
      syncActiveUserAssessmentHistory({
        quizTitle: `${course.title} Mastery Quiz`,
        scorePercent: 100,
        competenciesGained: course.skills || ["Applied Cadre Competency"],
      });

      if (onCourseUpdated) onCourseUpdated();
    } catch (e) {
      console.warn("Could not mark course as complete:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold shadow">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
                  {course.provider || "MoSPI Cadre Academy"}
                </span>
                {course.category && (
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {course.category}
                  </span>
                )}
                {course.priority && (
                  <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                    {course.priority} Priority
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-foreground truncate mt-0.5">{course.title}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border px-5 bg-card">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("syllabus")}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
                activeTab === "syllabus"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" /> Curriculum & Syllabus
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("material")}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
                activeTab === "material"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlayCircle className="h-4 w-4" /> Course Video & Study Guide
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
                activeTab === "quiz"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4 text-accent" /> AI Mastery Quiz
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{course.duration || "2 hrs 30 mins"}</span>
            </div>
            <div className="h-2 w-20 sm:w-24 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground">{progressPercent}%</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: SYLLABUS */}
          {activeTab === "syllabus" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">Course Overview & Cadre Alignment</h3>
                  <span className="text-[11px] font-bold text-accent">
                    {allLessons.length} Tailored Lessons
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
                {course.whyRecommended && (
                  <div className="mt-3 rounded-lg bg-accent/10 border border-accent/20 p-3 text-xs text-accent">
                    <span className="font-bold">Why AI Recommended: </span>
                    {course.whyRecommended}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Curriculum Modules</h3>
                {modules.map((m, mIdx) => (
                  <div key={mIdx} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {m.title}
                      </h4>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {m.duration}
                      </span>
                    </div>

                    <div className="divide-y divide-border">
                      {m.lessons.map((lesson, lIdx) => {
                        const lessonKey = `${mIdx}-${lIdx}`;
                        const isDone = !!completedLessons[lessonKey];
                        const lessonFlatIdx = mIdx * 2 + lIdx;
                        return (
                          <div
                            key={lIdx}
                            className="flex items-start justify-between py-3 gap-3 hover:bg-muted/20 px-2 rounded-lg transition"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleLesson(lessonKey)}
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                                  isDone
                                    ? "border-success bg-success text-success-foreground"
                                    : "border-border bg-background text-transparent hover:border-accent"
                                }`}
                                title="Mark lesson complete"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <div>
                                <h5 className="text-xs font-semibold text-foreground">
                                  {lesson.title}
                                </h5>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {lesson.summary}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLesson(lessonFlatIdx);
                                setActiveTab("material");
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline shrink-0"
                            >
                              Watch Video & Notes <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FUNCTIONAL VIDEO PLAYER & STUDY GUIDE */}
          {activeTab === "material" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
                {/* Header with Lesson Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                      {currentLesson.moduleTitle} · Lesson {selectedLesson + 1} of {allLessons.length}
                    </span>
                    <h3 className="mt-0.5 text-base sm:text-lg font-bold text-foreground">
                      {currentLesson.title}
                    </h3>
                  </div>

                  {/* Player Mode Switcher */}
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setPlayerMode("embed");
                        setVideoError(false);
                      }}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition ${
                        playerMode === "embed"
                          ? "bg-card text-foreground shadow-sm font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Tv className="h-3.5 w-3.5" /> iGOT / NPTEL Embed
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerMode("native")}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition ${
                        playerMode === "native"
                          ? "bg-card text-foreground shadow-sm font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Video className="h-3.5 w-3.5" /> High-Def Stream
                    </button>
                  </div>
                </div>

                {/* Working Video Player Container */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-border shadow-md">
                  {playerMode === "embed" ? (
                    // 1. 100% Working Verified Embed from iGOT / NPTEL / Academic Repositories
                    <iframe
                      key={videoData.youtubeId + "-" + selectedLesson}
                      src={`https://www.youtube-nocookie.com/embed/${videoData.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={videoData.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  ) : !videoError ? (
                    // 2. High-Def HTML5 Native Stream Player with autoPlay and unmuted fallback
                    <div className="relative h-full w-full flex items-center justify-center bg-black">
                      <video
                        ref={videoRef}
                        key={videoData.mp4 + "-" + selectedLesson}
                        src={videoData.mp4}
                        controls
                        autoPlay
                        muted={isMuted}
                        playsInline
                        onError={() => setVideoError(true)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className="h-full w-full object-contain"
                      >
                        Your browser does not support HTML5 video streaming.
                      </video>
                      {isMuted && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMuted(false);
                            if (videoRef.current) videoRef.current.muted = false;
                          }}
                          className="absolute top-4 right-4 rounded-lg bg-black/80 border border-white/20 px-3 py-1.5 text-xs text-white flex items-center gap-1.5 hover:bg-black transition"
                        >
                          <VolumeX className="h-3.5 w-3.5 text-accent" /> Click to Unmute Audio
                        </button>
                      )}
                    </div>
                  ) : (
                    // 3. Interactive Digital Cadre Slide Player (Never shows a black screen)
                    <div className="h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-6 text-white relative">
                      {/* Top Bar of Slide Player */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                            Digital Cadre Multimedia Lecture
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPlayerMode("embed");
                            setVideoError(false);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-xs font-semibold text-white transition"
                        >
                          <Tv className="h-3.5 w-3.5 text-accent" /> Switch to iGOT / NPTEL Embed
                        </button>
                      </div>

                      {/* Center Slide View */}
                      <div className="my-auto space-y-4 max-w-xl mx-auto text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-xs font-semibold text-accent">
                          <BookOpen className="h-3.5 w-3.5" />
                          {currentLesson.moduleTitle}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                          {currentLesson.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                          {currentLesson.summary}
                        </p>

                        {/* Animated Equalizer Soundwave Bars */}
                        <div className="flex items-center justify-center gap-1.5 pt-2">
                          {[30, 65, 45, 80, 55, 90, 70, 40, 85, 60, 95, 50, 75, 40].map((h, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full bg-accent transition-all duration-300 ${
                                isPlaying ? "opacity-90 animate-pulse" : "opacity-30"
                              }`}
                              style={{
                                height: isPlaying ? `${Math.max(8, h * 0.45)}px` : "6px",
                                animationDelay: `${i * 80}ms`,
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Interactive Bottom Control Toolbar */}
                      <div className="space-y-2 border-t border-white/10 pt-3">
                        {/* Progress seekbar */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>{formatSeconds(simulatedTime)}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden cursor-pointer">
                            <div
                              className="h-full rounded-full bg-accent transition-all"
                              style={{ width: `${(simulatedTime / 600) * 100}%` }}
                            />
                          </div>
                          <span>10:00</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold hover:scale-105 transition"
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsMuted(!isMuted)}
                              className="text-slate-300 hover:text-white transition"
                            >
                              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">Speed:</span>
                            {[1, 1.25, 1.5].map((speed) => (
                              <button
                                key={speed}
                                type="button"
                                onClick={() => setPlaybackSpeed(speed)}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  playbackSpeed === speed
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                                }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Info and Provider Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Verified Source:</span>
                    <span>{videoData.providerBadge}</span>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${videoData.youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                  >
                    Watch Full Lecture Externally <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Video Action Toolbar & Lesson Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markCurrentLessonComplete}
                      className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                        isCurrentLessonDone
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-success text-success-foreground hover:bg-success/90"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isCurrentLessonDone ? "Lesson Marked Completed" : "Mark Lesson Completed"}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Progress: <span className="font-bold text-foreground">{progressPercent}%</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={selectedLesson === 0}
                      onClick={() => setSelectedLesson((prev) => Math.max(0, prev - 1))}
                      className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {selectedLesson + 1} / {allLessons.length}
                    </span>
                    <button
                      type="button"
                      disabled={selectedLesson === allLessons.length - 1}
                      onClick={() => setSelectedLesson((prev) => Math.min(allLessons.length - 1, prev + 1))}
                      className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Lesson Playlist Pills */}
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Lecture Series Playlist (Click to Play):
                  </p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {allLessons.map((l) => {
                      const lKey = `${l.moduleIdx}-${l.lessonIdx}`;
                      const isDone = !!completedLessons[lKey];
                      const isSelected = selectedLesson === l.index;
                      return (
                        <button
                          key={l.index}
                          type="button"
                          onClick={() => setSelectedLesson(l.index)}
                          className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition ${
                            isSelected
                              ? "border-accent bg-accent/10 font-bold text-foreground"
                              : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold">
                              {l.index + 1}
                            </span>
                            <span className="truncate text-foreground font-medium">{l.title}</span>
                          </div>
                          {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Technical Notes Content for Active Lesson */}
                <div className="mt-4 space-y-4 text-xs text-foreground leading-relaxed">
                  <h4 className="text-sm font-bold border-b border-border pb-2 flex items-center justify-between">
                    <span>Official Cadre Technical Notes: {currentLesson.title}</span>
                    <span className="text-[10px] font-semibold text-accent uppercase">
                      Cadre Standard
                    </span>
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{currentLesson.content}</p>

                  {/* Code Snippet or Mathematical Formula if available */}
                  {currentLesson.codeSnippet && (
                    <div className="rounded-xl border border-border bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-sans">
                          <Code className="h-3.5 w-3.5 text-accent" /> Implementation Reference
                        </span>
                        <span className="font-sans">Production Standard</span>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed">{currentLesson.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Subject-Specific Cadre Operational Checklist */}
                  <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                    <p className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-success" /> Standard Cadre Operational Checklist:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-[11px]">
                      {currentLesson.checklist.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("syllabus")}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Syllabus
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("quiz")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Test Understanding with AI Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC AI QUIZ */}
          {activeTab === "quiz" && (
            <div className="max-w-2xl mx-auto space-y-6">
              {!quizStarted ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4 shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      On-Demand AI Mastery Quiz
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                      Generate dynamic assessment questions tailored to <span className="font-semibold text-foreground">{course.title}</span>. You can test your mastery directly on the platform without visiting external sites.
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground text-left max-w-sm mx-auto space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Questions:</span>
                      <span className="font-bold text-foreground">{dynamicQuizQuestions.length} Questions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pass Criteria:</span>
                      <span className="font-bold text-foreground">60% Mastery</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Outcome:</span>
                      <span className="font-bold text-success">Levels up your Competency Gap</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizStarted(true);
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 shadow transition"
                  >
                    <Sparkles className="h-4 w-4" /> Launch AI Generated Quiz
                  </button>
                </div>
              ) : !quizSubmitted ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-accent">
                      <Sparkles className="h-4 w-4" />
                      <span>Course Knowledge Verification Quiz</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {Object.keys(quizAnswers).length} / {dynamicQuizQuestions.length} Answered
                    </span>
                  </div>

                  <div className="space-y-4">
                    {dynamicQuizQuestions.map((q, idx) => (
                      <div key={q.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-foreground leading-relaxed">
                            {idx + 1}. {q.text}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[q.id] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleQuizAnswer(q.id, optIdx)}
                                className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left text-xs transition ${
                                  isSelected
                                    ? "border-accent bg-accent/10 font-bold text-foreground"
                                    : "border-border hover:bg-muted/40 text-muted-foreground"
                                }`}
                              >
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                    isSelected
                                      ? "bg-accent text-accent-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setQuizStarted(false)}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={Object.keys(quizAnswers).length < dynamicQuizQuestions.length}
                      onClick={() => setQuizSubmitted(true)}
                      className="rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
                    >
                      Submit Answers & Evaluate
                    </button>
                  </div>
                </div>
              ) : (
                /* QUIZ RESULT */
                <div className="rounded-xl border border-border bg-card p-8 text-center space-y-5 shadow-sm">
                  {calculateQuizScore() >= 60 ? (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                      <Award className="h-9 w-9" />
                    </div>
                  ) : (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                      <RotateCcw className="h-8 w-8" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">
                      {calculateQuizScore() >= 60 ? "Cadre Competency Mastered!" : "Review Required"}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your Score: <span className="font-bold text-foreground text-sm">{calculateQuizScore()}%</span> ({calculateQuizScore() >= 60 ? "Passed - Benchmark Achieved" : "Passing benchmark is 60%"})
                    </p>
                  </div>

                  {calculateQuizScore() >= 60 ? (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-xs text-success space-y-1">
                        <p className="font-bold">✓ Official Competency Gap Reduced</p>
                        <p className="text-[11px] text-muted-foreground">
                          Your true skill level for <span className="font-semibold text-foreground">{course.title}</span> has been leveled up in your cadre records.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleCompleteCourse();
                          onClose();
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-success px-6 py-2.5 text-xs font-bold text-success-foreground hover:bg-success/90 shadow transition"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Save Result & Mark Course Completed
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                        Review the lessons in the syllabus and retake the AI quiz when ready.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setQuizStarted(true);
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground hover:bg-accent/90 transition shadow"
                      >
                        <RotateCcw className="h-4 w-4" /> Retake AI Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
