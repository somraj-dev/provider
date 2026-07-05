# ============================================
# AxioVital OpenSearch Dockerfile
# Extends official OpenSearch image
# ============================================

FROM opensearchproject/opensearch:2

# Disable security plugin for development
ENV DISABLE_SECURITY_PLUGIN=true
ENV discovery.type=single-node
ENV OPENSEARCH_JAVA_OPTS="-Xms512m -Xmx512m"

EXPOSE 9200 9600
