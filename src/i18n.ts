export type Language = 'en' | 'vi';

const en = {
  // App header
  appTagline: 'Track your efficiency and costs',
  signOut: 'Sign Out',
  settings: 'Settings',
  loading: 'Loading your logs...',

  // Year filter
  filterTitle: 'Year',
  allTime: 'All',
  customRange: 'Custom',

  // Dashboard
  totalKilometers: 'Total Distance',
  avgConsumption: 'Avg Consumption',
  totalSpending: 'Total Spending',
  avgCostPer100km: 'Avg Cost/100',
  fuelPriceTrend: 'Fuel Price Trend (per unit)',

  // Table
  recentLogs: 'Recent Fuel Logs',
  addRecord: 'Add',
  import: 'Import',
  export: 'Export',
  show: 'Show:',
  page: 'Page',
  of: 'of',
  records: 'records',
  colDate: 'Date',
  colKm: 'Odometer',
  colLiters: 'Volume',
  colPriceL: 'Price/Unit',
  colTotal: 'Total',
  colDistance: 'Distance',
  colL100: 'Consumption',
  colCost100: 'Cost/100',
  colActions: 'Actions',
  noRecords: 'No records yet. Add your first fuel entry.',

  // Form
  formAddTitle: 'Add New Record',
  formEditTitle: 'Edit Fuel Record',
  fieldDate: 'Date',
  fieldKm: 'Odometer',
  fieldLiters: 'Volume Filled',
  fieldPrice: 'Price per Unit',
  estTotal: 'Estimated total:',
  cancel: 'Cancel',
  addRecordBtn: '+ Add Record',
  updateRecordBtn: '✓ Update Record',

  // DatePicker
  today: 'Today',
  selectYear: 'Select Year',
  selectDate: 'Select date',

  // Custom range modal
  selectCustomRange: 'Custom Date Range',
  startDate: 'Start Date',
  endDate: 'End Date',
  applyFilter: 'Apply Filter',
  pickStartDate: 'Pick start date',
  pickEndDate: 'Pick end date',

  // Settings
  settingsTitle: 'Settings',
  language: 'Language',
  langEnglish: 'English',
  langVietnamese: 'Tiếng Việt',
  close: 'Close',
  saveSettings: 'Save Changes',

  // Units settings
  units: 'Units',
  volumeUnit: 'Volume',
  distanceUnit: 'Distance',
  currencyUnit: 'Currency',
  unitLiter: 'Liter',
  unitGallon: 'Gallon',
  unitKm: 'Kilometer',
  unitMile: 'Mile',
  unitVND: 'Vietnamese Đồng',
  unitUSD: 'US Dollar',
  unitEUR: 'Euro',
};

const vi: typeof en = {
  // App header
  appTagline: 'Theo dõi hiệu suất và chi phí xăng',
  signOut: 'Đăng xuất',
  settings: 'Cài đặt',
  loading: 'Đang tải dữ liệu...',

  // Year filter
  filterTitle: 'Năm',
  allTime: 'Tất cả',
  customRange: 'Tùy chỉnh',

  // Dashboard
  totalKilometers: 'Tổng quãng đường',
  avgConsumption: 'Mức tiêu thụ TB',
  totalSpending: 'Tổng chi phí',
  avgCostPer100km: 'Chi phí TB/100',
  fuelPriceTrend: 'Biến động giá xăng',

  // Table
  recentLogs: 'Nhật ký nhiên liệu',
  addRecord: 'Thêm',
  import: 'Nhập',
  export: 'Xuất',
  show: 'Hiển thị:',
  page: 'Trang',
  of: '/',
  records: 'bản ghi',
  colDate: 'Ngày',
  colKm: 'Đồng hồ',
  colLiters: 'Lượng',
  colPriceL: 'Giá/đơn vị',
  colTotal: 'Tổng',
  colDistance: 'Quãng đường',
  colL100: 'Tiêu thụ',
  colCost100: 'Chi phí/100',
  colActions: 'Thao tác',
  noRecords: 'Chưa có dữ liệu. Hãy thêm lần đổ xăng đầu tiên.',

  // Form
  formAddTitle: 'Thêm bản ghi mới',
  formEditTitle: 'Chỉnh sửa bản ghi',
  fieldDate: 'Ngày',
  fieldKm: 'Số đồng hồ',
  fieldLiters: 'Lượng đổ',
  fieldPrice: 'Giá mỗi đơn vị',
  estTotal: 'Tổng ước tính:',
  cancel: 'Hủy',
  addRecordBtn: '+ Thêm bản ghi',
  updateRecordBtn: '✓ Cập nhật',

  // DatePicker
  today: 'Hôm nay',
  selectYear: 'Chọn năm',
  selectDate: 'Chọn ngày',

  // Custom range modal
  selectCustomRange: 'Khoảng thời gian tùy chỉnh',
  startDate: 'Từ ngày',
  endDate: 'Đến ngày',
  applyFilter: 'Áp dụng',
  pickStartDate: 'Chọn ngày bắt đầu',
  pickEndDate: 'Chọn ngày kết thúc',

  // Settings
  settingsTitle: 'Cài đặt',
  language: 'Ngôn ngữ',
  langEnglish: 'English',
  langVietnamese: 'Tiếng Việt',
  close: 'Đóng',
  saveSettings: 'Lưu thay đổi',

  // Units settings
  units: 'Đơn vị',
  volumeUnit: 'Thể tích',
  distanceUnit: 'Khoảng cách',
  currencyUnit: 'Tiền tệ',
  unitLiter: 'Lít',
  unitGallon: 'Gallon',
  unitKm: 'Kilômét',
  unitMile: 'Dặm',
  unitVND: 'Đồng Việt Nam',
  unitUSD: 'Đô la Mỹ',
  unitEUR: 'Euro',
};

export const translations = { en, vi };
export type TranslationKey = keyof typeof en;
