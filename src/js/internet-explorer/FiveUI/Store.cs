using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Windows.Forms;  // provides MessageBox

using Unit    = System.Byte;  // arbitrary choice
using Key     = System.String;
using Value   = System.String;
using TxId    = System.String;
using KeyPair = System.Tuple<System.String, System.String>;

namespace FiveUI
{
    public class Store
    {
        public Store(Dictionary<string, string> store, Port port) {
            port.on("getKeys", data =>
            {
                var msg  = JSON.Parse<Message<Unit>>(data);
                var resp = Response(msg, store.Keys);
                port.emit("getKeys.resp", JSON.Stringify(resp));
            });

            port.on("getItem", data =>
            {
                MessageBox.Show("getItem: "+ data);
                string defaultVal = null;
                var msg  = JSON.Parse<Message<Key>>(data);
                var key  = msg.data;
                var val  = store.TryGetValue(key, out defaultVal);
                var resp = Response(msg, Tuple.Create(key, val));
                port.emit("getItem.resp", JSON.Stringify(resp));
            });

            port.on("setItem", data =>
            {
                MessageBox.Show("setItem: "+ data);
                var msg  = JSON.Parse<Message<KeyPair>>(data);
                var pair = msg.data;
                var key  = pair.Item1;
                var val  = pair.Item2;
                store[key] = val;
                // TODO: respond with success message?
            });

            port.on("removeItem", data =>
            {
                var msg  = JSON.Parse<Message<Key>>(data);
                var key  = msg.data;
                store.Remove(key);
            });

            port.on("clear", data =>
            {
                var msg  = JSON.Parse<Message<Unit>>(data);
                store.Clear();
            });
        }

        private Message<T> Response<T,U>(Message<U> message, T val)
        {
            return new Message<T>()
            {
                data = val,
                txId = message.txId
            };
        }
    }

    [DataContract]
    public class Message<T>
    {
        [DataMember]
        public T data { get; set; }

        [DataMember]
        public TxId txId { get; set; }
    }
}
