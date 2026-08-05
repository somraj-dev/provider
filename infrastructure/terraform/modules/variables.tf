variable "aws_region" {
  description = "AWS Region for AxioVital Cloud Resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment Environment (development, staging, production)"
  type        = string
  default     = "development"
}

variable "cluster_name" {
  description = "EKS Cluster Name for AxioVital Backend"
  type        = string
  default     = "axiovital-cluster"
}
