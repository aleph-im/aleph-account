
import { posts } from 'aleph-js'

export async function update_post (postitem, new_values, account, api_server, channel) {
  let post_content = {}
  Object.assign(post_content, postitem.content, new_values)

  let msg = await posts.submit(
    account.address, 'amend', post_content,
    {
      channel: channel,
      api_server: api_server,
      account: account,
      ref: postitem.hash
    })
  msg.content = post_content
  msg.hash = postitem.hash
  msg.original_type = postitem.original_type
  msg.original_ref = postitem.original_ref
  return msg
}
