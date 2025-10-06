// Quotation Status

export const QuotationStatus = {
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const QUOTATION_STATUS = [
  QuotationStatus.SUBMITTED,
  QuotationStatus.APPROVED,
  QuotationStatus.REJECTED,
];

export const QUOTATION_STATUS_LABEL = {
  [QuotationStatus.SUBMITTED]: "Pending",
  [QuotationStatus.APPROVED]: "Approved",
  [QuotationStatus.REJECTED]: "Rejected",
};

// Purchase Order Status
export const PO_STATUS = {
  PENDING: "Pending",
  PO_SENT: "PO_Sent",
};

export const PO_STATUS_LABEL = {
  [PO_STATUS.PENDING]: "Pending",
  [PO_STATUS.PO_SENT]: "PO Sent",
};

export const PO_STATUS_OPTIONS = [
  { value: PO_STATUS.PENDING, label: PO_STATUS_LABEL[PO_STATUS.PENDING] },
  { value: PO_STATUS.PO_SENT, label: PO_STATUS_LABEL[PO_STATUS.PO_SENT] },
];

export const PO_SUBMIT_STATUS = [PO_STATUS.PO_SENT];

export const REPAIR_REQUEST_SEVERITY_OPTIONS = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical'
};
