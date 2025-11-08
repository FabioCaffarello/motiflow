FROM apache/spark:4.0.1

USER root
COPY ./requirements.txt /tmp/requirements.txt
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip && \
    pip3 install --no-cache-dir -r /tmp/requirements.txt && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

USER spark
ENV PYSPARK_PYTHON=/usr/bin/python3
ENV PYSPARK_DRIVER_PYTHON=/usr/bin/python3

COPY ./conf/spark-defaults.conf "$SPARK_HOME/conf/spark-defaults.conf"
COPY ./conf/core-site.xml "$SPARK_HOME/conf/core-site.xml"