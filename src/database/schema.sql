create table user_token ( slack_name varchar, gbdx_access_token varchar, gbdx_refresh_token varchar, gbdx_api_key varchar);
create index idx_user_token_slack_name on user_token (slack_name);
