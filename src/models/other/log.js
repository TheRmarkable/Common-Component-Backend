class WalletLog {
    constructor(message, ...details) {
        let {timestamp, level, calling_module, json_data, user} = details[0] ?? {};
        this.data = {
            source: '',
            source_local_ip: '',
            source_public_ip: '',
            app_layer: process.env.APP_LAYER,
            app_name: process.env.APP_NAME,
            timestamp: timestamp ?? new Date().getTime(),
            by_whom: user || '',
            code_filename: calling_module,
            code_line_no: '',
            log_level: level?.toUpperCase(),
            sensitive_fields: '',
            message: message
        }
        this.json_extra = json_data;
    }

    json_as_str(data) {
        if (Array.isArray(data)) {
            let result = []
            data.forEach(item => result.push(JSON.stringify(item)));
            return result.join("; ");
        } else {
            return JSON.stringify(data);
        }
    }

    get as_text() {
        let {timestamp, message, log_level, code_filename, by_whom} = this.data;
        let json_str = this.json_extra ? ` | ${this.json_as_str(this.json_extra)}` : '';
        return [
          log_level,
          timestamp,
          by_whom,
          code_filename,
          message,
          json_str  
        ]
        .filter(e => e)
        .join("\t|\t");
    }

    get as_json() {
        return {...this.json_data, ...this.data};
    }
}

module.exports = WalletLog;
